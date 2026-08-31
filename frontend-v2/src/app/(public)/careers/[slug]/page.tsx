import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSlugs, getJobBySlug } from "@/lib/careers/jobs";
import { JobDetailLayout } from "@/components/careers/job-detail/JobDetailLayout";
import { pageMetadata } from "@/lib/seo/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const job = getJobBySlug(slug);
  if (!job) return {};

  return pageMetadata({
    title: `${job.title} | Careers at AROORAA`,
    description: job.summary,
    path: `/careers/${job.slug}`,
  });
}

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = getJobBySlug(slug);
  if (!job) notFound();

  return <JobDetailLayout job={job} />;
}
