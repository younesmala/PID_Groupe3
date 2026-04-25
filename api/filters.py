import django_filters
from catalogue.models.show import Show


class ShowFilter(django_filters.FilterSet):
    title = django_filters.CharFilter(
        field_name='title', lookup_expr='icontains'
    )
    bookable = django_filters.BooleanFilter(field_name='bookable')
    created_after = django_filters.DateFilter(
        field_name='created_at', lookup_expr='gte'
    )

    class Meta:
        model = Show
        fields = ['title', 'bookable']