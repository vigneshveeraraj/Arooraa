package com.arooraa.leads.admin.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

import static org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO;

/**
 * Without this, Spring Data serializes Page<T> as the internal PageImpl shape, which
 * Spring Data itself warns is not a stable JSON contract. VIA_DTO renders the documented,
 * stable PagedModel shape (content/page.{size,number,totalElements,totalPages}) instead.
 */
@Configuration
@EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)
public class WebConfig {
}
