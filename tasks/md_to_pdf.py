import sys
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, black, white, grey
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Preformatted, KeepTogether, HRFlowable
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY


def parse_markdown(md_text):
    """Parse markdown into reportlab elements."""
    lines = md_text.split('\n')
    elements = []
    i = 0
    in_code = False
    code_lines = []
    in_table = False
    table_rows = []

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Code block
        if stripped.startswith('```'):
            if not in_code:
                in_code = True
                code_lines = []
            else:
                in_code = False
                code_text = '\n'.join(code_lines)
                elements.append(('code', code_text))
            i += 1
            continue

        if in_code:
            code_lines.append(line)
            i += 1
            continue

        # Empty line
        if not stripped:
            i += 1
            continue

        # Horizontal rule
        if stripped == '---' or stripped == '***' or stripped == '___':
            elements.append(('hr', ''))
            i += 1
            continue

        # Table
        if '|' in stripped and not stripped.startswith('#') and not stripped.startswith('*') and not stripped.startswith('-'):
            # Check if it's a table row
            parts = [p.strip() for p in stripped.split('|')]
            parts = [p for p in parts if p or p == '']
            if len(parts) >= 2 and all(set(p) <= set('-|:') for p in parts):
                # Separator row, skip
                i += 1
                continue
            if not in_table:
                in_table = True
                table_rows = []
            table_rows.append(parts)
            i += 1
            continue
        elif in_table:
            in_table = False
            elements.append(('table', table_rows))
            table_rows = []
            continue

        # Heading
        m = re.match(r'^(#{1,6})\s+(.+)$', stripped)
        if m:
            level = len(m.group(1))
            text = m.group(2)
            elements.append((f'h{level}', text))
            i += 1
            continue

        # Blockquote
        if stripped.startswith('>'):
            text = stripped[1:].strip()
            elements.append(('quote', text))
            i += 1
            continue

        # List item
        m = re.match(r'^(\s*)[-*+]\s+(.+)$', line)
        if m:
            indent = len(m.group(1))
            text = m.group(2)
            elements.append(('bullet', text, indent))
            i += 1
            continue

        # Numbered list
        m = re.match(r'^(\s*)\d+\.\s+(.+)$', line)
        if m:
            indent = len(m.group(1))
            text = m.group(2)
            elements.append(('numbered', text, indent))
            i += 1
            continue

        # Checkbox list
        m = re.match(r'^(\s*)[-*+]\s+\[(.?)\]\s+(.+)$', line)
        if m:
            checked = m.group(2) == 'x'
            text = m.group(3)
            elements.append(('checkbox', text, checked))
            i += 1
            continue

        # Normal paragraph
        elements.append(('p', stripped))
        i += 1

    if in_table and table_rows:
        elements.append(('table', table_rows))

    return elements


def md_to_inline(text):
    """Convert markdown inline formatting to reportlab XML tags."""
    # Escape XML special chars
    text = text.replace('&', '&amp;')
    text = text.replace('<', '&lt;').replace('>', '&gt;')
    # Bold **text** or __text__
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'__(.+?)__', r'<b>\1</b>', text)
    # Italic *text* (single asterisks, not inside words)
    text = re.sub(r'(?<![\w*])\*(?!\*)(.+?)(?<!\*)\*(?![\w*])', r'<i>\1</i>', text)
    # Inline code
    text = re.sub(r'`(.+?)`', r'<font face="Courier" size="9" color="#D63384">\1</font>', text)
    # Links [text](url)
    text = re.sub(r'\[(.+?)\]\((.+?)\)', r'<a href="\2" color="blue"><u>\1</u></a>', text)
    return text


def build_pdf(input_path, output_path, title):
    with open(input_path, 'r', encoding='utf-8') as f:
        md_text = f.read()

    parsed = parse_markdown(md_text)

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    styles.add(ParagraphStyle(
        name='H1', parent=styles['Heading1'], fontSize=22, spaceAfter=14,
        textColor=HexColor('#1a365d'), fontName='Helvetica-Bold',
    ))
    styles.add(ParagraphStyle(
        name='H2', parent=styles['Heading2'], fontSize=16, spaceAfter=10,
        textColor=HexColor('#2c5282'), fontName='Helvetica-Bold',
    ))
    styles.add(ParagraphStyle(
        name='H3', parent=styles['Heading3'], fontSize=13, spaceAfter=8,
        textColor=HexColor('#2b6cb0'), fontName='Helvetica-Bold',
    ))
    styles.add(ParagraphStyle(
        name='H4', parent=styles['Heading4'], fontSize=11, spaceAfter=6,
        textColor=HexColor('#3182ce'), fontName='Helvetica-Bold',
    ))
    styles.add(ParagraphStyle(
        name='Body', parent=styles['Normal'], fontSize=9.5, leading=14,
        alignment=TA_JUSTIFY, spaceAfter=6,
    ))
    styles.add(ParagraphStyle(
        name='CodeBlock', parent=styles['Code'], fontSize=8, leading=11,
        backColor=HexColor('#f7fafc'), leftIndent=12, rightIndent=12,
        spaceAfter=8, fontName='Courier',
    ))
    styles.add(ParagraphStyle(
        name='Quote', parent=styles['Normal'], fontSize=9.5, leading=14,
        leftIndent=24, rightIndent=24, textColor=grey, spaceAfter=6,
        backColor=HexColor('#f7fafc'),
    ))
    styles.add(ParagraphStyle(
        name='MyBullet', parent=styles['Normal'], fontSize=9.5, leading=14,
        leftIndent=24, bulletIndent=12, spaceAfter=3,
    ))
    styles.add(ParagraphStyle(
        name='MyNumbered', parent=styles['Normal'], fontSize=9.5, leading=14,
        leftIndent=24, spaceAfter=3,
    ))
    styles.add(ParagraphStyle(
        name='MyCheckbox', parent=styles['Normal'], fontSize=9.5, leading=14,
        leftIndent=24, spaceAfter=3,
    ))

    story = []

    # Title page
    story.append(Spacer(1, 1.5*inch))
    story.append(Paragraph(title, ParagraphStyle(
        name='MyTitle', fontSize=26, alignment=TA_CENTER,
        textColor=HexColor('#1a365d'), fontName='Helvetica-Bold',
        spaceAfter=20,
    )))
    story.append(HRFlowable(width="60%", thickness=1, color=HexColor('#2c5282'), hAlign='CENTER'))
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph(f"Generated: 2026-06-22", ParagraphStyle(
        name='Subtitle', fontSize=10, alignment=TA_CENTER, textColor=grey,
    )))
    story.append(PageBreak())

    for elem in parsed:
        tag = elem[0]
        text = elem[1] if len(elem) > 1 else ''

        if tag == 'h1':
            story.append(Paragraph(md_to_inline(text), styles['H1']))
        elif tag == 'h2':
            story.append(Paragraph(md_to_inline(text), styles['H2']))
        elif tag == 'h3':
            story.append(Paragraph(md_to_inline(text), styles['H3']))
        elif tag == 'h4':
            story.append(Paragraph(md_to_inline(text), styles['H4']))
        elif tag == 'h5' or tag == 'h6':
            story.append(Paragraph(md_to_inline(text), styles['H4']))
        elif tag == 'p':
            story.append(Paragraph(md_to_inline(text), styles['Body']))
        elif tag == 'code':
            story.append(Preformatted(text, styles['CodeBlock']))
            story.append(Spacer(1, 4))
        elif tag == 'quote':
            story.append(Paragraph(md_to_inline(text), styles['Quote']))
        elif tag == 'bullet':
            indent = elem[2] if len(elem) > 2 else 0
            level = indent // 2
            bullet_char = '•'
            indent_px = 18 + level * 12
            story.append(Paragraph(
                f"<font color='#2c5282'>{bullet_char}</font>  {md_to_inline(text)}",
                ParagraphStyle(
                    name=f'Bullet{level}', parent=styles['MyBullet'],
                    leftIndent=indent_px, bulletIndent=indent_px - 12,
                )
            ))
        elif tag == 'numbered':
            indent = elem[2] if len(elem) > 2 else 0
            level = indent // 2
            indent_px = 18 + level * 12
            story.append(Paragraph(
                md_to_inline(text),
                ParagraphStyle(
                    name=f'Numbered{level}', parent=styles['MyNumbered'],
                    leftIndent=indent_px,
                )
            ))
        elif tag == 'checkbox':
            checked = elem[2] if len(elem) > 2 else False
            box = '☑' if checked else '☐'
            story.append(Paragraph(
                f"{box}  {md_to_inline(text)}", styles['MyCheckbox']
            ))
        elif tag == 'hr':
            story.append(Spacer(1, 8))
            story.append(HRFlowable(width="100%", thickness=0.5, color=HexColor('#cbd5e0')))
            story.append(Spacer(1, 8))
        elif tag == 'table':
            rows = text
            if len(rows) < 2:
                continue
            # Use first row as header
            header = rows[0]
            data = rows[1:]
            # Build table data with Paragraphs
            table_data = []
            # Header row
            header_paras = [Paragraph(f'<b>{md_to_inline(cell)}</b>', ParagraphStyle(
                name='TableHeader', fontSize=8, textColor=white,
                fontName='Helvetica-Bold', alignment=TA_LEFT,
            )) for cell in header]
            table_data.append(header_paras)
            # Data rows
            for row in data:
                row_paras = [Paragraph(md_to_inline(cell), ParagraphStyle(
                    name='TableCell', fontSize=8, alignment=TA_LEFT,
                )) for cell in row]
                table_data.append(row_paras)

            col_count = len(header)
            available_width = A4[0] - 1.5*inch
            col_width = available_width / col_count

            t = Table(table_data, colWidths=[col_width]*col_count)
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), HexColor('#2c5282')),
                ('TEXTCOLOR', (0, 0), (-1, 0), white),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 8),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
                ('BACKGROUND', (0, 1), (-1, -1), HexColor('#f7fafc')),
                ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#e2e8f0')),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(Spacer(1, 6))
            story.append(t)
            story.append(Spacer(1, 6))

    doc.build(story)
    print(f"PDF created: {output_path}")


if __name__ == '__main__':
    build_pdf('/workspace/app-cikf8p3h6lmp/README.md',
              '/workspace/app-cikf8p3h6lmp/tasks/AeroForensics_AI_README.pdf',
              'AeroForensics AI — README')
    build_pdf('/workspace/app-cikf8p3h6lmp/TECH_STACK.md',
              '/workspace/app-cikf8p3h6lmp/tasks/AeroForensics_AI_TECH_STACK.pdf',
              'AeroForensics AI — Technology Stack')
