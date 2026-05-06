import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ExamPDFPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const [{ data: bank }, { data: questions }] = await Promise.all([
    supabase.from('exam_banks').select('*').eq('id', params.id).single(),
    supabase.from('exam_questions').select('*').eq('bank_id', params.id).order('question_number'),
  ]);

  if (!bank) notFound();

  const OPTIONS = ['A', 'B', 'C', 'D'] as const;
  const OPT_LABELS: Record<string, string> = { A: 'option_a', B: 'option_b', C: 'option_c', D: 'option_d' };

  return (
    <>
      <style>{`
        @page { size: A4; margin: 20mm 15mm; }
        body { font-family: 'Times New Roman', serif; font-size: 12pt; color: #000; background: #fff; }
        @media screen {
          body { max-width: 210mm; margin: 0 auto; padding: 20mm 15mm; background: #f5f5f5; }
          .paper { background: white; padding: 20mm 15mm; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        }
        .print-btn { position: fixed; bottom: 24px; right: 24px; background: #4f46e5; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; cursor: pointer; font-family: sans-serif; font-weight: 600; box-shadow: 0 4px 12px rgba(79,70,229,0.4); z-index: 999; }
        @media print { .print-btn { display: none; } .paper { box-shadow: none; padding: 0; } }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px; }
        .header h1 { font-size: 18pt; font-weight: bold; margin: 0; }
        .header h2 { font-size: 14pt; margin: 4px 0; }
        .meta { display: flex; justify-content: space-between; font-size: 10pt; margin-bottom: 16px; border: 1px solid #ccc; padding: 8px 12px; }
        .instructions { font-size: 10pt; margin-bottom: 20px; border: 1px solid #000; padding: 10px; }
        .instructions h3 { margin: 0 0 6px; font-size: 11pt; }
        .instructions ol { margin: 0; padding-left: 16px; }
        .question-block { margin-bottom: 20px; page-break-inside: avoid; }
        .question-block p { margin: 0 0 6px; font-weight: bold; }
        .options { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-left: 16px; }
        .option { font-size: 11pt; }
        .answer-key { margin-top: 30px; border-top: 2px dashed #000; padding-top: 20px; }
        .answer-key h3 { text-align: center; font-size: 13pt; margin-bottom: 12px; }
        .answer-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 6px; font-size: 10pt; text-align: center; }
        .answer-item { border: 1px solid #ccc; padding: 3px; }
        .answer-item .q { font-weight: bold; background: #eee; display: block; }
        .answer-item .a { color: #4f46e5; font-weight: bold; display: block; }
        .footer { text-align: center; font-size: 9pt; color: #666; margin-top: 20px; border-top: 1px solid #ccc; padding-top: 8px; }
        .omr-row { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; font-size: 10pt; }
        .omr-bubble { display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; border: 1px solid #000; border-radius: 50%; font-size: 9pt; }
      `}</style>
      <button className="print-btn" onClick={() => window.print()}>🖨️ Print / Save as PDF</button>

      <div className="paper">
        {/* Header */}
        <div className="header">
          <h1>UniNest Exam Platform</h1>
          <h2>{bank.title}</h2>
          <p style={{ fontSize: '11pt', margin: '4px 0 0' }}>{bank.subject} · {bank.exam_type}</p>
        </div>

        {/* Meta */}
        <div className="meta">
          <span><strong>Duration:</strong> {bank.duration_minutes} minutes</span>
          <span><strong>Total Marks:</strong> {bank.total_marks}</span>
          <span><strong>Questions:</strong> {questions?.length || 0}</span>
          <span><strong>Negative Marking:</strong> {bank.negative_marking ? `−${bank.negative_marks_per_wrong} per wrong` : 'None'}</span>
          <span><strong>Difficulty:</strong> {bank.difficulty}</span>
        </div>

        {/* Instructions */}
        <div className="instructions">
          <h3>Instructions:</h3>
          <ol>
            <li>Each question has four options (A, B, C, D). Choose the most correct answer.</li>
            <li>Each correct answer carries <strong>{(questions?.[0]?.marks) || 4} marks</strong>.</li>
            {bank.negative_marking && <li>Each wrong answer will deduct <strong>{bank.negative_marks_per_wrong} marks</strong>.</li>}
            <li>Unanswered questions will not be penalised.</li>
            <li>Do not use whitener or overwrite answers on the OMR sheet.</li>
          </ol>
        </div>

        {/* Questions */}
        <div>
          {(questions || []).map((q, i) => (
            <div key={q.id} className="question-block">
              <p>Q{q.question_number}. ({q.marks}M) {q.question_text}</p>
              <div className="options">
                {OPTIONS.map(opt => (
                  <div key={opt} className="option">
                    ({opt}) {q[OPT_LABELS[opt] as keyof typeof q] as string}
                  </div>
                ))}
              </div>
              {/* OMR bubbles */}
              <div className="omr-row" style={{ marginTop: '6px', marginLeft: '16px' }}>
                <span style={{ fontSize: '9pt', marginRight: '4px' }}>Mark:</span>
                {OPTIONS.map(opt => (
                  <span key={opt} className="omr-bubble">{opt}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Answer Key (fold-down) */}
        <div className="answer-key">
          <h3>— Answer Key —</h3>
          <div className="answer-grid">
            {(questions || []).map(q => (
              <div key={q.id} className="answer-item">
                <span className="q">{q.question_number}</span>
                <span className="a">{q.correct_option}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="footer">
          Generated by UniNest Exam Platform · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          <br />
          Practice online at uninest.in/exams
        </div>
      </div>
    </>
  );
}
