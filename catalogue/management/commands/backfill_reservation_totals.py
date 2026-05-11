from decimal import Decimal

from django.core.management.base import BaseCommand, CommandError
from django.db.models import Prefetch

from catalogue.models import Reservation
from catalogue.models.reservation import RepresentationReservation


ZERO = Decimal("0.00")


class Command(BaseCommand):
    help = (
        "Backfill Reservation.total_paid when it is zero using reservation lines, "
        "then show prices as fallback."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--apply",
            action="store_true",
            help="Persist computed totals in database. Without this flag, runs in dry-run mode.",
        )
        parser.add_argument(
            "--only-paid",
            action="store_true",
            help="Process only reservations with payment_status='paid'.",
        )
        parser.add_argument(
            "--default-amount",
            type=str,
            help=(
                "Fallback amount per ticket (EUR) used only when no historical "
                "price data is available. Example: 5.00"
            ),
        )

    def handle(self, *args, **options):
        apply_changes = options["apply"]
        only_paid = options["only_paid"]
        default_amount = self._parse_default_amount(options.get("default_amount"))

        queryset = Reservation.objects.select_related(
            "representation__show"
        ).prefetch_related(
            Prefetch(
                "representation_reservations",
                queryset=RepresentationReservation.objects.select_related("price"),
            ),
            "representation__show__prices",
        ).filter(total_paid=ZERO)

        if only_paid:
            queryset = queryset.filter(payment_status="paid")

        checked_count = 0
        updated_count = 0
        unresolved_ids = []

        for reservation in queryset.iterator(chunk_size=200):
            checked_count += 1
            computed_total = self._compute_total(reservation, default_amount)

            if computed_total > ZERO:
                if apply_changes:
                    reservation.total_paid = computed_total
                    reservation.save(update_fields=["total_paid"])
                updated_count += 1
            else:
                unresolved_ids.append(reservation.id)

        mode = "APPLY" if apply_changes else "DRY-RUN"
        self.stdout.write(self.style.SUCCESS(f"Mode: {mode}"))
        self.stdout.write(f"Reservations checked: {checked_count}")
        self.stdout.write(f"Reservations with recoverable total: {updated_count}")
        self.stdout.write(f"Reservations still unresolved: {len(unresolved_ids)}")

        if unresolved_ids:
            preview = ", ".join(str(value) for value in unresolved_ids[:30])
            suffix = " ..." if len(unresolved_ids) > 30 else ""
            self.stdout.write(f"Unresolved reservation IDs: {preview}{suffix}")

        if not apply_changes:
            self.stdout.write(
                self.style.WARNING(
                    "Dry-run only. Re-run with --apply to persist computed totals."
                )
            )

    @staticmethod
    def _compute_total(reservation, default_amount):
        total_from_lines = ZERO
        for line in reservation.representation_reservations.all():
            if line.price_id and line.price:
                total_from_lines += line.price.price * line.quantity

        if total_from_lines > ZERO:
            return total_from_lines

        if reservation.representation_id and reservation.representation.show_id:
            show_prices = reservation.representation.show.prices.all()
            minimum_amount = min(
                (show_price.amount for show_price in show_prices),
                default=ZERO,
            )
            if minimum_amount > ZERO:
                return minimum_amount * reservation.quantity

        if default_amount and default_amount > ZERO:
            return default_amount * reservation.quantity

        return ZERO

    def _parse_default_amount(self, raw_amount):
        if raw_amount is None:
            return None
        try:
            amount = Decimal(str(raw_amount))
        except Exception as exc:
            raise CommandError("--default-amount must be a decimal number, e.g. 5.00") from exc

        if amount <= ZERO:
            raise CommandError("--default-amount must be greater than 0")

        return amount
