# 📄 SiteSage PDF Report Generator

Complete React-PDF implementation for generating professional SEO reports.

## ✅ Features

- **Circular Progress Charts** - Animated score indicators
- **Responsive Layout** - Professional A4 format
- **Content Analysis Table** - Detailed metrics breakdown
- **Technical Health Section** - Feature checklist with status
- **AI Summary Box** - Highlighted recommendations
- **Priority Actions** - Numbered action items with color coding
- **Dark Header Design** - Modern professional styling
- **Dynamic Data** - Accepts Report type from API

## 📦 Installation

The required dependency has been installed:

```bash
npm install @react-pdf/renderer
```

## 🚀 Current Integration

### Report Page ([id]/page.tsx)

The PDF download button is now integrated into the report view page:

```tsx
// For authenticated users
<PDFDownloadLink
  document={<SiteSageReportPDF data={report} />}
  fileName={`sitesage-report-${report.url}.pdf`}
>
  {({ loading }) => (
    <Button isLoading={loading}>
      {loading ? "Generating PDF..." : "Export PDF Report"}
    </Button>
  )}
</PDFDownloadLink>

// For guests
<Button onPress={() => router.push('/login')}>
  Login to Export PDF
</Button>
```

### Features

- ✅ **Authentication Gate** - Only logged-in users can download
- ✅ **Dynamic File Names** - Based on URL and date
- ✅ **Loading States** - Shows progress during generation
- ✅ **Real Report Data** - Uses actual data from API
- ✅ **No SSR Issues** - Dynamically imported to avoid server-side rendering problems

## 📐 Data Mapping

The PDF component maps the `Report` type to the PDF format:

```typescript
Report {
  url → websiteUrl
  title → pageTitle
  created_at → generatedDate
  load_time → loadTime
  seo_score → scores.overall
  lighthouse_* → scores.*
  word_count → content.wordCount
  h1_count → content.h1
  h2_count → content.h2
  image_count + missing_alt_count → content.images
  robots_txt_exists → technical.robots
  sitemap_exists → technical.sitemap
  og_tags_present → technical.ogTags
  schema_present → technical.schema
  top_keywords → keywords[]
  ai_summary → aiSummary
  ai_suggestions → priorityActions[]
}
```

## 🎨 Customization

### Change Colors

Edit the color map in `SiteSageReportPDF.jsx`:

```javascript
const colorMap = {
  green: '#10b981',  // Success color
  yellow: '#f59e0b', // Warning color
  red: '#ef4444',    // Error color
};
```

### Modify Scoring Thresholds

Update the `getScoreColor` function:

```javascript
const getScoreColor = (score) => {
  if (score >= 90) return 'green';  // Excellent
  if (score >= 50) return 'yellow'; // Average
  return 'red';                      // Needs work
};
```

### Customize Word Count Status

Edit `getWordCountStatus`:

```javascript
const getWordCountStatus = (count) => {
  if (count < 300) return 'Low';
  if (count < 1000) return 'Good';
  return 'Excellent';
};
```

## 📝 Usage Examples

See `PDFUsageExample.jsx` for comprehensive examples including:

1. Basic download link
2. Styled button with loading state
3. PDF preview in browser
4. Authentication-gated downloads
5. Multiple report downloads
6. Error handling
7. API integration

## 🔧 Advanced Features

### Preview Before Download

Create a preview page:

```tsx
import { PDFViewer } from '@react-pdf/renderer';
import SiteSageReportPDF from './SiteSageReportPDF';

function PreviewPage({ report }) {
  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <SiteSageReportPDF data={report} />
    </PDFViewer>
  );
}
```

### Custom Fonts

Add custom fonts:

```javascript
import { Font } from '@react-pdf/renderer';

Font.register({
  family: 'Inter',
  src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
});
```

### Multi-Page Reports

Extend with additional pages:

```jsx
<Document>
  <Page size="A4">
    {/* Page 1: Summary */}
    <SiteSageReportPDF data={report} />
  </Page>
  <Page size="A4">
    {/* Page 2: Detailed Analysis */}
    <DetailedAnalysis data={report} />
  </Page>
</Document>
```

## 🐛 Troubleshooting

### "Document is not defined" Error

**Solution:** Ensure dynamic imports in Next.js:

```tsx
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);
```

### Slow PDF Generation

**Causes:**
- Large datasets
- Many images
- Complex calculations

**Solutions:**
- Limit data (e.g., top 5 keywords instead of 50)
- Show loading indicator
- Generate on button click, not page load

### Styling Issues

**Remember:** react-pdf has limited CSS support

✅ **Supported:**
- flexbox (display: 'flex')
- padding, margin
- backgroundColor, color
- fontSize, fontWeight
- borderRadius, borderWidth

❌ **Not Supported:**
- box-shadow
- transform
- transition
- grid layout

## 📱 File Structure

```
frontend/src/components/dashboard/pdf/
├── SiteSageReportPDF.jsx      # Main PDF component
├── PDFUsageExample.jsx        # Usage examples
└── README.md                  # This file
```

## 🎯 Best Practices

1. **Always validate data** before passing to PDF component
2. **Use loading states** for better UX
3. **Sanitize file names** to remove special characters
4. **Handle missing data** gracefully with fallbacks
5. **Test with edge cases** (empty data, missing fields)
6. **Consider file size** - limit data when necessary
7. **Add error boundaries** to catch PDF generation errors

## 📊 Score Color Reference

| Score Range | Color  | Meaning       |
|-------------|--------|---------------|
| 90-100      | Green  | Excellent     |
| 50-89       | Yellow | Needs work    |
| 0-49        | Red    | Critical      |

## 🔐 Security Notes

- PDF generation happens client-side (no server load)
- Authentication required for download
- No sensitive data exposed in file names
- Report data already fetched securely via API

## 📅 Last Updated

December 22, 2025

## 📚 Resources

- [@react-pdf/renderer Documentation](https://react-pdf.org/)
- [Supported CSS Properties](https://react-pdf.org/styling)
- [Examples Repository](https://github.com/diegomura/react-pdf/tree/master/examples)

## 🤝 Contributing

When adding new features to the PDF:

1. Test with various report data
2. Ensure responsive layout remains intact
3. Keep file size reasonable
4. Update this README
5. Add examples to PDFUsageExample.jsx
