import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Circle,
  Path,
  Image,
} from "@react-pdf/renderer";
import { Report } from "@/types/api";

interface CircularScoreProps {
  score: number;
  color: "green" | "yellow" | "red";
}

interface SiteSageReportPDFProps {
  data: Report;
}

const styles = StyleSheet.create({
  page: {
    padding: 0,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  header: {
    backgroundColor: "#10120e",
    color: "#ffffff",
    padding: "16 28",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  headerLogo: {
    width: 140,
    height: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  headerSubtext: {
    fontSize: 9,
    color: "#94a3b8",
  },
  headerRight: {
    textAlign: "right",
  },
  headerWebsite: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  statusBadge: {
    backgroundColor: "#182f09",
    color: "#ffffff",
    fontSize: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    border: "1px solid #60BE25",
    alignSelf: "flex-end",
  },
  container: {
    padding: "16 24",
  },
  pageTitle: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  pageTitleLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#94a3b8",
    textTransform: "uppercase",
    marginBottom: 3,
    letterSpacing: 0.8,
  },
  pageTitleText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
    lineHeight: 1.3,
  },
  metaInfo: {
    display: "flex",
    flexDirection: "row",
    gap: 24,
    fontSize: 9,
    color: "#64748b",
  },
  metaItem: {
    display: "flex",
    flexDirection: "row",
    gap: 4,
  },
  scoreCardsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    padding: "8 10",
    textAlign: "center",
  },
  scoreCardLabel: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#94a3b8",
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  contentGrid: {
    display: "flex",
    flexDirection: "row",
    gap: 20,
    marginBottom: 16,
  },
  contentColumn: {
    flex: 1,
  },
  columnHeader: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 4,
  },
  table: {
    width: "100%",
    marginBottom: 10,
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    color: "#64748b",
  },
  tableCellValue: {
    flex: 1,
    fontSize: 9,
    color: "#1e293b",
    fontFamily: "Courier",
    fontWeight: "bold",
    textAlign: "right",
  },
  badgeRed: {
    color: "#dc2626",
    fontSize: 8,
    fontWeight: "bold",
  },
  keywordsLabel: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#94a3b8",
    textTransform: "uppercase",
    marginTop: 8,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  keywordContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  keyword: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
  },
  techHealthItem: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: "6 8",
    marginBottom: 5,
    borderRadius: 4,
  },
  techHealthItemMissing: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  techHealthLabel: {
    fontSize: 9,
    color: "#475569",
  },
  techHealthStatus: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "bold",
  },
  techHealthMissing: {
    fontSize: 7,
    color: "#dc2626",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  aiSummaryBox: {
    backgroundColor: "#eef2ff",
    borderLeftWidth: 3,
    borderLeftColor: "#6366f1",
    padding: 10,
    marginBottom: 10,
    borderRadius: 3,
  },
  aiSummaryTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#4338ca",
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 0.6,
  },
  aiSummaryText: {
    fontSize: 9,
    color: "#3730a3",
    lineHeight: 1.5,
  },
  prioritySection: {
    marginTop: 8,
  },
  priorityTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1e293b",
    textTransform: "uppercase",
    marginBottom: 8,
    letterSpacing: 0.6,
  },
  priorityItem: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: "6 8",
    marginBottom: 5,
    borderRadius: 4,
  },
  priorityNumber: {
    width: 18,
    height: 18,
    borderRadius: 9,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 9,
    fontWeight: "bold",
    flexShrink: 0,
  },
  priorityNumber1: {
    backgroundColor: "#fca5a5",
    color: "#7f1d1d",
  },
  priorityNumber2: {
    backgroundColor: "#fcd34d",
    color: "#78350f",
  },
  priorityNumber3: {
    backgroundColor: "#93c5fd",
    color: "#1e3a8a",
  },
  priorityContent: {
    flex: 1,
  },
  priorityText: {
    fontSize: 8,
    color: "#475569",
    lineHeight: 1.4,
  },
});

// Brand colors from tailwind config
const BRAND_COLORS = {
  seoGreen: "#60BE25",
  trustBlue: "#008DEA",
  alertOrange: "#FF692E",
  deepOlive: "#41493B",
};

// Checkmark Icon Component
const CheckIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="12" fill={BRAND_COLORS.seoGreen} />
    <Path
      d="M9 12.5l2 2 4-4"
      fill="none"
      stroke="#ffffff"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CircularScore: React.FC<CircularScoreProps> = ({ score, color }) => {
  const colorMap: Record<"green" | "yellow" | "red", string> = {
    green: BRAND_COLORS.seoGreen,
    yellow: BRAND_COLORS.alertOrange,
    red: "#ef4444",
  };

  const strokeColor = colorMap[color] || colorMap.green;

  // Calculate the arc parameters
  const radius = 15.9155;
  const circumference = 2 * Math.PI * radius;
  // Ensure dashLength is valid: clamp between 0.1 and circumference, round to avoid floating point issues
  const clampedScore = Math.max(0, Math.min(100, score));
  const dashLength = Math.max(
    0.1,
    Math.round((clampedScore / 100) * circumference * 100) / 100
  );
  const gapLength = Math.max(
    0.1,
    Math.round((circumference - dashLength) * 100) / 100
  );

  return (
    <View
      style={{ width: 60, height: 60, margin: "0 auto", position: "relative" }}
    >
      <Svg viewBox="0 0 36 36" style={{ width: 60, height: 60 }}>
        {/* Background circle */}
        <Circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="3.5"
        />
        {/* Colored progress circle */}
        {clampedScore > 0 && (
          <Circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeDasharray={`${dashLength} ${gapLength}`}
            strokeLinecap="round"
          />
        )}
      </Svg>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "bold", color: "#0f172a" }}>
          {score}
        </Text>
      </View>
    </View>
  );
};

const SiteSageReportPDF: React.FC<SiteSageReportPDFProps> = ({ data }) => {
  // Helper function to determine score color
  const getScoreColor = (score: number): "green" | "yellow" | "red" => {
    if (score >= 90) return "green";
    if (score >= 50) return "yellow";
    return "red";
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to get canonical status
  const getCanonicalStatus = (report: Report): string => {
    return report.title ? "Self-referencing" : "Not set";
  };

  // Helper function to get word count status
  const getWordCountStatus = (count: number): string => {
    if (count < 300) return "Low";
    if (count < 1000) return "Good";
    return "Excellent";
  };

  // Map the Report data to PDF format
  const reportData = {
    websiteUrl: data.url || "N/A",
    pageTitle: data.title || "Untitled Page",
    generatedDate: formatDate(data.created_at),
    loadTime: `${(data.load_time || 0).toFixed(2)}s`,
    canonical: getCanonicalStatus(data),
    scores: {
      overall: {
        value: Math.round(data.seo_score || 0),
        color: getScoreColor(data.seo_score || 0),
      },
      performance: {
        value: Math.round(data.lighthouse_performance || 0),
        color: getScoreColor(data.lighthouse_performance || 0),
      },
      access: {
        value: Math.round(data.lighthouse_accessibility || 0),
        color: getScoreColor(data.lighthouse_accessibility || 0),
      },
      bestPractices: {
        value: Math.round(data.lighthouse_best_practices || 0),
        color: getScoreColor(data.lighthouse_best_practices || 0),
      },
    },
    content: {
      wordCount: {
        label: "Word Count",
        value: String(data.word_count || 0),
        status: getWordCountStatus(data.word_count || 0),
      },
      h1: { label: "H1 Headings", value: String(data.h1_count || 0) },
      h2: { label: "H2 Headings", value: String(data.h2_count || 0) },
      images: {
        label: "Images",
        value: `${data.image_count || 0} (${
          data.missing_alt_count || 0
        } missing alt)`,
      },
    },
    technical: {
      robots: {
        label: "Robots.txt",
        status: data.robots_txt_exists ? "ok" : "missing",
      },
      sitemap: {
        label: "Sitemap.xml",
        status: data.sitemap_exists ? "ok" : "missing",
      },
      ogTags: {
        label: "OG Tags",
        status: data.og_tags_present ? "ok" : "missing",
      },
      schema: {
        label: "Schema Markup",
        status: data.schema_present ? "ok" : "missing",
      },
    },
    keywords: data.top_keywords || [],
    aiSummary: data.ai_summary || "Analysis in progress...",
    priorityActions: (data.ai_suggestions || [])
      .slice(0, 3)
      .map((suggestion, index) => ({
        number: index + 1,
        title: suggestion.split(":")[0] || suggestion.substring(0, 30),
        description: suggestion.split(":")[1] || suggestion,
        color: index === 0 ? "red" : index === 1 ? "orange" : "blue",
      })),
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View>
              <Image
                src={`https://assets.tanishdev.me/logo-horizontal-white.png?v=${new Date().getTime()}`}
                style={styles.headerLogo}
              />
              <Text style={styles.headerSubtext}>
                Generated on {reportData.generatedDate}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerWebsite}>{reportData.websiteUrl}</Text>
            <View style={styles.statusBadge}>
              <Text>Status: Online</Text>
            </View>
          </View>
        </View>

        {/* Main Container */}
        <View style={styles.container}>
          {/* Page Title Section */}
          <View style={styles.pageTitle}>
            <Text style={styles.pageTitleLabel}>PAGE TITLE</Text>
            <Text style={styles.pageTitleText}>{reportData.pageTitle}</Text>
            <View style={styles.metaInfo}>
              <View style={styles.metaItem}>
                <Text>Load Time: </Text>
                <Text style={{ fontWeight: "bold" }}>
                  {reportData.loadTime}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Text>Canon: </Text>
                <Text style={{ fontWeight: "bold" }}>
                  {reportData.canonical}
                </Text>
              </View>
            </View>
          </View>

          {/* Score Cards */}
          <View style={styles.scoreCardsContainer}>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreCardLabel}>Overall SEO</Text>
              <CircularScore
                score={reportData.scores.overall.value}
                color={reportData.scores.overall.color}
              />
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreCardLabel}>Performance</Text>
              <CircularScore
                score={reportData.scores.performance.value}
                color={reportData.scores.performance.color}
              />
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreCardLabel}>Access</Text>
              <CircularScore
                score={reportData.scores.access.value}
                color={reportData.scores.access.color}
              />
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreCardLabel}>Best Practices</Text>
              <CircularScore
                score={reportData.scores.bestPractices.value}
                color={reportData.scores.bestPractices.color}
              />
            </View>
          </View>

          {/* Content Analysis & Technical Health */}
          <View style={styles.contentGrid}>
            {/* Content Analysis */}
            <View style={styles.contentColumn}>
              <Text style={styles.columnHeader}>Content Analysis</Text>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>
                    {reportData.content.wordCount.label}
                  </Text>
                  <Text style={styles.tableCellValue}>
                    {reportData.content.wordCount.value}{" "}
                    <Text style={styles.badgeRed}>
                      ({reportData.content.wordCount.status})
                    </Text>
                  </Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>
                    {reportData.content.h1.label}
                  </Text>
                  <Text style={styles.tableCellValue}>
                    {reportData.content.h1.value}
                  </Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>
                    {reportData.content.h2.label}
                  </Text>
                  <Text style={styles.tableCellValue}>
                    {reportData.content.h2.value}
                  </Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>
                    {reportData.content.images.label}
                  </Text>
                  <Text style={styles.tableCellValue}>
                    {reportData.content.images.value}
                  </Text>
                </View>
              </View>

              {reportData.keywords.length > 0 && (
                <View>
                  <Text style={styles.keywordsLabel}>TOP KEYWORDS</Text>
                  <View style={styles.keywordContainer}>
                    {reportData.keywords.slice(0, 8).map((keyword, index) => (
                      <View key={index} style={styles.keyword}>
                        <Text>{keyword}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Technical Health */}
            <View style={styles.contentColumn}>
              <Text style={styles.columnHeader}>Technical Health</Text>
              <View style={styles.techHealthItem}>
                <Text style={styles.techHealthLabel}>Robots.txt</Text>
                {reportData.technical.robots.status === "ok" ? (
                  <CheckIcon />
                ) : (
                  <Text style={styles.techHealthMissing}>MISSING</Text>
                )}
              </View>
              <View style={styles.techHealthItem}>
                <Text style={styles.techHealthLabel}>Sitemap.xml</Text>
                {reportData.technical.sitemap.status === "ok" ? (
                  <CheckIcon />
                ) : (
                  <Text style={styles.techHealthMissing}>MISSING</Text>
                )}
              </View>
              <View style={styles.techHealthItem}>
                <Text style={styles.techHealthLabel}>OG Tags</Text>
                {reportData.technical.ogTags.status === "ok" ? (
                  <CheckIcon />
                ) : (
                  <Text style={styles.techHealthMissing}>MISSING</Text>
                )}
              </View>
              <View
                style={[
                  styles.techHealthItem,
                  ...(reportData.technical.schema.status !== "ok"
                    ? [styles.techHealthItemMissing]
                    : []),
                ]}
              >
                <Text
                  style={[
                    styles.techHealthLabel,
                    ...(reportData.technical.schema.status !== "ok"
                      ? [{ color: "#dc2626" }]
                      : []),
                  ]}
                >
                  Schema Markup
                </Text>
                {reportData.technical.schema.status === "ok" ? (
                  <CheckIcon />
                ) : (
                  <Text style={styles.techHealthMissing}>MISSING</Text>
                )}
              </View>
            </View>
          </View>

          {/* AI Summary */}
          {reportData.aiSummary && (
            <View style={styles.aiSummaryBox}>
              <Text style={styles.aiSummaryTitle}>AI SUMMARY</Text>
              <Text style={styles.aiSummaryText}>{reportData.aiSummary}</Text>
            </View>
          )}

          {/* Priority Action Items */}
          {reportData.priorityActions &&
            reportData.priorityActions.length > 0 && (
              <View style={styles.prioritySection}>
                <Text style={styles.priorityTitle}>PRIORITY ACTION ITEMS</Text>
                {reportData.priorityActions.map((action, index) => (
                  <View key={index} style={styles.priorityItem}>
                    <View
                      style={[
                        styles.priorityNumber,
                        action.color === "red"
                          ? styles.priorityNumber1
                          : action.color === "orange"
                          ? styles.priorityNumber2
                          : styles.priorityNumber3,
                      ]}
                    >
                      <Text>{action.number}</Text>
                    </View>
                    <View style={styles.priorityContent}>
                      <Text style={styles.priorityTitle}>{action.title}</Text>
                      <Text style={styles.priorityText}>
                        {action.description}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
        </View>
      </Page>
    </Document>
  );
};

export default SiteSageReportPDF;
