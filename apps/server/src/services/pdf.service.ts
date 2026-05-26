import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { logger } from '@/utils/logger';

export class PDFService {
  public async generateAssessmentPDF(assessment: any): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const dir = path.join(__dirname, '../../temp/pdfs');
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        const filePath = path.join(dir, `${assessment._id}.pdf`);
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 60, left: 50, right: 50 },
          bufferPages: true, // Buffer all pages for footers page counting
        });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // --- DRAW HEADER BANNER / SCHOOL INFO BOX ---
        // Double borders
        doc.rect(50, 50, 495, 110).lineWidth(2).stroke();
        doc.rect(53, 53, 489, 104).lineWidth(0.5).stroke();

        doc.font('Helvetica-Bold').fontSize(14).fillColor('#000000').text('VEDA ACADEMIC ASSESSMENT SHEET', 50, 68, { align: 'center', width: 495 });
        
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#444444');
        doc.text(`SUBJECT: ${assessment.subject.toUpperCase()}`, 70, 95);
        doc.text(`CLASS/GRADE: ${assessment.classGrade.toUpperCase()}`, 70, 110);
        doc.text(`MAX MARKS: ${assessment.marks} PTS`, 320, 95);
        doc.text(`DATE: ${new Date(assessment.dueDate).toLocaleDateString()}`, 320, 110);

        doc.lineWidth(0.5).dash(4, { space: 2 }).moveTo(70, 130).lineTo(260, 130).stroke();
        doc.text('STUDENT NAME: ', 70, 140);
        doc.lineWidth(0.5).moveTo(150, 150).lineTo(260, 150).undash().stroke();

        doc.text('ROLL NO / ID: ', 320, 140);
        doc.lineWidth(0.5).moveTo(390, 150).lineTo(480, 150).stroke();

        // Move cursor below header
        let currentY = 180;

        if (assessment.instructions) {
          doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000').text('GENERAL INSTRUCTIONS:', 50, currentY);
          doc.font('Helvetica').fontSize(9).fillColor('#555555').text(assessment.instructions, 50, currentY + 15, { width: 495, align: 'justify' });
          currentY += 45 + Math.ceil(assessment.instructions.length / 100) * 10;
        }

        const paper = assessment.generatedPaper;
        if (paper && paper.questions && paper.questions.length > 0) {
          const mcqs = paper.questions.filter((q: any) => q.type === 'mcq' || q.type === 'multiple-choice');
          const shorts = paper.questions.filter((q: any) => q.type === 'short-answer');
          const codings = paper.questions.filter((q: any) => q.type === 'coding' || q.type === 'essay');

          // --- SECTION A: MCQS ---
          if (mcqs.length > 0) {
            doc.font('Helvetica-Bold').fontSize(11).fillColor('#000000').text('SECTION A: OBJECTIVE ASSESSMENT', 50, currentY);
            doc.lineWidth(1).moveTo(50, currentY + 15).lineTo(545, currentY + 15).stroke();
            doc.font('Helvetica-Oblique').fontSize(8).fillColor('#666666').text('Instruction: Choose the correct option below. Each question carries equal designated points.', 50, currentY + 22);
            currentY += 40;

            mcqs.forEach((q: any, idx: number) => {
              if (currentY > 730) { doc.addPage(); currentY = 70; }
              doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000').text(`Q${idx + 1}.`, 50, currentY);
              doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000').text(`(${q.points} Pts)`, 500, currentY);
              doc.font('Helvetica').fontSize(9).fillColor('#111111').text(q.prompt, 75, currentY, { width: 420 });
              
              currentY += Math.max(20, Math.ceil(q.prompt.length / 85) * 12);

              if (q.options) {
                q.options.forEach((opt: any) => {
                  if (currentY > 750) { doc.addPage(); currentY = 70; }
                  doc.font('Helvetica').fontSize(8.5).fillColor('#444444').text(`[   ]  ${opt.text}`, 90, currentY, { width: 400 });
                  currentY += 16;
                });
              }
              currentY += 10;
            });
            currentY += 15;
          }

          // --- SECTION B: SHORT ANSWERS ---
          if (shorts.length > 0) {
            if (currentY > 650) { doc.addPage(); currentY = 70; }
            doc.font('Helvetica-Bold').fontSize(11).fillColor('#000000').text('SECTION B: SHORT-ANSWER QUESTIONS', 50, currentY);
            doc.lineWidth(1).moveTo(50, currentY + 15).lineTo(545, currentY + 15).stroke();
            doc.font('Helvetica-Oblique').fontSize(8).fillColor('#666666').text('Instruction: Write concise conceptual answers. Support statements with logical reasoning.', 50, currentY + 22);
            currentY += 40;

            shorts.forEach((q: any, idx: number) => {
              if (currentY > 680) { doc.addPage(); currentY = 70; }
              doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000').text(`Q${idx + 1}.`, 50, currentY);
              doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000').text(`(${q.points} Pts)`, 500, currentY);
              doc.font('Helvetica').fontSize(9).fillColor('#111111').text(q.prompt, 75, currentY, { width: 420 });

              currentY += Math.max(20, Math.ceil(q.prompt.length / 85) * 12) + 5;
              
              // Draw lined spaces for handwritten answers
              for (let line = 0; line < 3; line++) {
                if (currentY > 760) { doc.addPage(); currentY = 70; }
                doc.lineWidth(0.3).moveTo(75, currentY + 15).lineTo(500, currentY + 15).stroke();
                currentY += 20;
              }
              currentY += 12;
            });
            currentY += 15;
          }

          // --- SECTION C: CODINGS ---
          if (codings.length > 0) {
            if (currentY > 650) { doc.addPage(); currentY = 70; }
            doc.font('Helvetica-Bold').fontSize(11).fillColor('#000000').text('SECTION C: DISCIPLINE PRACTICALS & CODING', 50, currentY);
            doc.lineWidth(1).moveTo(50, currentY + 15).lineTo(545, currentY + 15).stroke();
            doc.font('Helvetica-Oblique').fontSize(8).fillColor('#666666').text('Instruction: Provide clean and structured answers or complete executable codes.', 50, currentY + 22);
            currentY += 40;

            codings.forEach((q: any, idx: number) => {
              if (currentY > 680) { doc.addPage(); currentY = 70; }
              doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000').text(`Q${idx + 1}.`, 50, currentY);
              doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000').text(`(${q.points} Pts)`, 500, currentY);
              doc.font('Helvetica').fontSize(9).fillColor('#111111').text(q.prompt, 75, currentY, { width: 420 });

              currentY += Math.max(20, Math.ceil(q.prompt.length / 85) * 12) + 5;

              // Lined spaces
              for (let line = 0; line < 4; line++) {
                if (currentY > 760) { doc.addPage(); currentY = 70; }
                doc.lineWidth(0.3).moveTo(75, currentY + 20).lineTo(500, currentY + 20).stroke();
                currentY += 25;
              }
              currentY += 12;
            });
          }
        }

        // --- FOOTERS & HEADERS ON EVERY PAGE ---
        const range = doc.bufferedPageRange();
        for (let i = range.start; i < range.start + range.count; i++) {
          doc.switchToPage(i);

          // Draw page header (on all pages except first page)
          if (i > 0) {
            doc.font('Helvetica').fontSize(7.5).fillColor('#888888').text(`VEDA AI ASSESSMENT  |  ${assessment.title.toUpperCase()}`, 50, 25);
            doc.lineWidth(0.3).moveTo(50, 35).lineTo(545, 35).stroke();
          }

          // Draw footer on all pages
          doc.lineWidth(0.3).moveTo(50, 790).lineTo(545, 790).stroke();
          doc.font('Helvetica').fontSize(7.5).fillColor('#888888').text('CONFIDENTIAL - FOR ACADEMIC EVALUATION ONLY', 50, 798);
          doc.text(`Page ${i + 1} of ${range.count}`, 500, 798);
        }

        doc.end();

        stream.on('finish', () => {
          logger.info(`PDF generated successfully for assessment ${assessment._id}`);
          resolve(filePath);
        });

        stream.on('error', (err) => {
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}

export const pdfService = new PDFService();
export default pdfService;
