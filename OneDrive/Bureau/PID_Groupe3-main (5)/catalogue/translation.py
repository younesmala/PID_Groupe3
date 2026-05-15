from modeltranslation.translator import TranslationOptions, register

from catalogue.models import Artist, Show, Type


@register(Show)
class ShowTranslationOptions(TranslationOptions):
    fields = ("title", "description")


@register(Artist)
class ArtistTranslationOptions(TranslationOptions):
    fields = ("firstname", "lastname")


@register(Type)
class TypeTranslationOptions(TranslationOptions):
    fields = ("type",)
