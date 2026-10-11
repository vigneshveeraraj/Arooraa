package com.arooraa.leads.capture.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class LeadLanguageConverter implements AttributeConverter<LeadLanguage, String> {

    @Override
    public String convertToDatabaseColumn(LeadLanguage attribute) {
        return attribute == null ? null : attribute.code();
    }

    @Override
    public LeadLanguage convertToEntityAttribute(String dbData) {
        return LeadLanguage.fromCode(dbData);
    }
}
