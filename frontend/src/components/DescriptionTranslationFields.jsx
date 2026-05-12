import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const allLanguages = ['fr', 'en', 'nl'];

function DescriptionTranslationFields({ descriptions, onDescriptionChange }) {
    const { t, i18n } = useTranslation();
    const currentUILang = i18n.language;

    // Filter out the current UI language from the available languages for secondary fields
    const availableSecondaryLangs = allLanguages.filter(lang => lang !== currentUILang);

    // State to manage which languages are selected in the two dropdowns
    // Initialize with the first two available secondary languages
    const [secondaryLangSelections, setSecondaryLangSelections] = useState(() => {
        // Ensure we always have two distinct languages, even if only one is available
        const initial = [availableSecondaryLangs[0] || '', availableSecondaryLangs[1] || ''];
        // If only one secondary language is available, ensure the second slot is empty or a placeholder
        if (availableSecondaryLangs.length === 1) {
            initial[1] = ''; // Or some other placeholder
        }
        return initial;
    });

    // Effect to re-adjust selections if the current UI language changes
    useEffect(() => {
        const newAvailable = allLanguages.filter(lang => lang !== currentUILang);
        const newSelections = [];

        // Try to keep existing selections if they are still valid
        secondaryLangSelections.forEach(selectedLang => {
            if (newAvailable.includes(selectedLang) && !newSelections.includes(selectedLang)) {
                newSelections.push(selectedLang);
            }
        });

        // Fill remaining slots with new available languages
        newAvailable.forEach(lang => {
            if (!newSelections.includes(lang) && newSelections.length < 2) {
                newSelections.push(lang);
            }
        });

        // Ensure we always have two slots, even if one is empty
        while (newSelections.length < 2) {
            newSelections.push('');
        }

        setSecondaryLangSelections(newSelections);
    }, [currentUILang]); // Depend on currentUILang to re-run when UI language changes


    const handleSecondaryLangDropdownChange = useCallback((index, selectedLang) => {
        setSecondaryLangSelections(prev => {
            const newSelection = [...prev];
            newSelection[index] = selectedLang;
            return newSelection;
        });
    }, []);

    return (
        <div className="translation-fields-container">
            <h3>{t('producer.translation_description_subtitle')}</h3>

            {secondaryLangSelections.map((selectedLang, index) => {
                if (!selectedLang) return null; // Don't render if no language is selected for this slot

                const availableOptionsForThisDropdown = allLanguages.filter(lang =>
                    lang !== currentUILang && // Cannot be the main UI language
                    (index === 0 ? lang !== secondaryLangSelections[1] : lang !== secondaryLangSelections[0]) // Cannot be the other selected secondary language
                );

                return (
                    <div key={`secondary-desc-${index}`} className="psf-field">
                        <label className="psf-label" htmlFor={`description-${selectedLang}`}>{t('producer.select_language_label')}</label>
                        <select id={`lang-select-${index}`} value={selectedLang} onChange={(e) => handleSecondaryLangDropdownChange(index, e.target.value)} className="psf-input">
                            <option value="">{t('producer.select_language_placeholder')}</option>
                            {availableOptionsForThisDropdown.map(lang => (<option key={lang} value={lang}>{t(`producer.language_${lang}`)}</option>))}
                        </select>
                        <textarea id={`description-${selectedLang}`} name={`description_${selectedLang}`} className="psf-input psf-textarea" value={descriptions[selectedLang] || ''} onChange={(e) => onDescriptionChange(selectedLang, e.target.value)} rows={5} placeholder={`${t('producer.description_placeholder')} (${t(`producer.language_${selectedLang}`)})`}/>
                    </div>
                );
            })}
        </div>
    );
}

export default DescriptionTranslationFields;