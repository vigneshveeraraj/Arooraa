import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FEATURED_STORY, FUTURE_STORY, STORIES_HEADING, SUPPORTING_STORIES } from "@/lib/content/stories";
import styles from "./Stories.module.css";

export function Stories() {
  return (
    <Section tone="dark" spacing="default">
      <Container>
        <SectionHeading eyebrow={STORIES_HEADING.eyebrow} title={STORIES_HEADING.title} />

        <div className={styles.storiesLayout}>
          <article className={styles.featuredStory}>
            <p className={`text-label ${styles.storyEyebrow}`}>{FEATURED_STORY.eyebrow}</p>
            <h3 className="text-h2">{FEATURED_STORY.title}</h3>
            <p className={`text-body-lg ${styles.storyBody}`}>{FEATURED_STORY.body}</p>
            {FEATURED_STORY.closingLine ? <p className={styles.closingLine}>{FEATURED_STORY.closingLine}</p> : null}
          </article>

          <div className={styles.fragmentGrid}>
            {SUPPORTING_STORIES.map((story) => (
              <article key={story.id} className={styles.storyFragment}>
                <p className={`text-label ${styles.storyEyebrow}`}>{story.eyebrow}</p>
                <h3 className="text-h3">{story.title}</h3>
                <p className={`text-body-sm ${styles.storyBody}`}>{story.body}</p>
              </article>
            ))}
          </div>
        </div>

        <Card className={styles.futureCallout}>
          <Badge variant="neutral">{FUTURE_STORY.badge}</Badge>
          <p className={`text-eyebrow ${styles.futureLabel}`}>{FUTURE_STORY.label}</p>
          <p className={`text-body ${styles.futureScenario}`}>{FUTURE_STORY.scenario}</p>
          <p className={styles.futureClosing}>{FUTURE_STORY.closingLine}</p>
        </Card>
      </Container>
    </Section>
  );
}
