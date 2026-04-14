from modeltranslation.translator import register, TranslationOptions
from catalogue.models import Show, Artist, Type


@register(Show)
class ShowTranslationOptions(TranslationOptions):
    fields = ('title', 'description')


@register(Artist)
class ArtistTranslationOptions(TranslationOptions):
    fields = ('firstname', 'lastname')


@register(Type)
class TypeTranslationOptions(TranslationOptions):
    fields = ('type',)
