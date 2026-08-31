import Link from "next/link";
import type { InsightArticle } from "@/lib/insights/types";
import styles from "./ArticleBody.module.css";

interface ArticleBodyProps {
  article: InsightArticle;
}

/**
 * The article's long-form content (Phase 10) — typed sections rendered as
 * semantic <h2>/<p> (never dangerouslySetInnerHTML), so heading order stays
 * logical under the page's single <h1> (Phase 19). Optional editorial
 * product links (Phase 13) render as a restrained list, only when present —
 * never forced onto every article.
 */
export function ArticleBody({ article }: ArticleBodyProps) {
  return (
    <div className={styles.body}>
      {article.content.map((section, index) => (
        <div key={section.heading ?? `section-${index}`} className={styles.section}>
          {section.heading ? <h2 className={`text-h2 ${styles.heading}`}>{section.heading}</h2> : null}
          {section.paragraphs.map((paragraph, paragraphIndex) => (
            <p key={paragraphIndex} className={`text-body-lg ${styles.paragraph}`}>
              {paragraph}
            </p>
          ))}
        </div>
      ))}

      {article.relatedProductLinks && article.relatedProductLinks.length > 0 ? (
        <aside className={styles.productLinks} aria-label="Related AROORAA products">
          <ul className={styles.productLinksList}>
            {article.relatedProductLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={styles.productLink}>
                  {link.label} <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </div>
  );
}
