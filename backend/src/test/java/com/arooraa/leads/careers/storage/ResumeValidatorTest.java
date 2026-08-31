package com.arooraa.leads.careers.storage;

import com.arooraa.leads.careers.exception.InvalidResumeException;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ResumeValidatorTest {

    private static final byte[] PDF_BYTES = "%PDF-1.4\nsome pdf content".getBytes(StandardCharsets.US_ASCII);
    private static final byte[] DOCX_BYTES = new byte[]{0x50, 0x4B, 0x03, 0x04, 0x01, 0x02};
    private static final byte[] DOC_BYTES =
            new byte[]{(byte) 0xD0, (byte) 0xCF, 0x11, (byte) 0xE0, (byte) 0xA1, (byte) 0xB1, 0x1A, (byte) 0xE1, 0x01};

    private final ResumeValidator validator = new ResumeValidator(5 * 1024 * 1024);

    @Test
    void acceptsAValidPdf() {
        ValidatedResume result = validator.validate(
                new MockMultipartFile("resume", "My Resume.pdf", "application/pdf", PDF_BYTES));

        assertEquals("application/pdf", result.contentType());
        assertEquals("pdf", result.extension());
        assertEquals("My Resume.pdf", result.sanitizedOriginalFilename());
        assertEquals(PDF_BYTES.length, result.size());
    }

    @Test
    void acceptsAValidDocx() {
        ValidatedResume result = validator.validate(new MockMultipartFile("resume", "resume.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document", DOCX_BYTES));
        assertEquals("docx", result.extension());
    }

    @Test
    void acceptsAValidDoc() {
        ValidatedResume result = validator.validate(
                new MockMultipartFile("resume", "resume.doc", "application/msword", DOC_BYTES));
        assertEquals("doc", result.extension());
    }

    @Test
    void rejectsAnUnsupportedDeclaredType() {
        InvalidResumeException ex = assertThrows(InvalidResumeException.class, () -> validator.validate(
                new MockMultipartFile("resume", "resume.exe", "application/x-msdownload", new byte[]{1, 2, 3})));
        assertEquals("Resume must be a PDF, DOC or DOCX file.", ex.getMessage());
    }

    @Test
    void rejectsContentThatDoesNotMatchItsDeclaredType() {
        // Declares PDF but the bytes are plain text — the declared Content-Type alone is never trusted.
        InvalidResumeException ex = assertThrows(InvalidResumeException.class, () -> validator.validate(
                new MockMultipartFile("resume", "resume.pdf", "application/pdf", "not a pdf".getBytes(StandardCharsets.UTF_8))));
        assertEquals("Resume file content doesn't match its declared type.", ex.getMessage());
    }

    @Test
    void rejectsAnOversizedFile() {
        ResumeValidator smallLimitValidator = new ResumeValidator(10);
        InvalidResumeException ex = assertThrows(InvalidResumeException.class, () -> smallLimitValidator.validate(
                new MockMultipartFile("resume", "resume.pdf", "application/pdf", PDF_BYTES)));
        assertEquals("Resume must be smaller than 0 MB.", ex.getMessage());
    }

    @Test
    void rejectsAnEmptyFile() {
        assertThrows(InvalidResumeException.class, () -> validator.validate(
                new MockMultipartFile("resume", "resume.pdf", "application/pdf", new byte[0])));
    }

    @Test
    void sanitizesAPathLikeFilenameWithoutEverBuildingAPathFromIt() {
        ValidatedResume result = validator.validate(
                new MockMultipartFile("resume", "../../etc/passwd.pdf", "application/pdf", PDF_BYTES));
        assertEquals("passwd.pdf", result.sanitizedOriginalFilename());
    }

    @Test
    void collapsesUnsafeCharactersInTheOriginalFilename() {
        ValidatedResume result = validator.validate(
                new MockMultipartFile("resume", "resume<script>.pdf", "application/pdf", PDF_BYTES));
        assertEquals("resume_script_.pdf", result.sanitizedOriginalFilename());
    }
}
