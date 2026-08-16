
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  ChevronRight,
  X,
  HelpCircle,
  GraduationCap,
  ListChecks,
  Key
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { AppView, Document } from '../types';
import { SaveLoadControls } from './SaveLoadControls';

interface QuizCreatorProps {
  onSaveDoc: (doc: Document) => void;
  onNavigate: (view: AppView, id: string | null) => void;
  onBack: () => void;
}

export const QuizCreator: React.FC<QuizCreatorProps> = ({ 
  onSaveDoc, 
  onNavigate, 
  onBack 
}) => {
  const [topic, setTopic] = useState(() => localStorage.getItem('cordoval_quiz_topic') || '');
  const [guidance, setGuidance] = useState(() => localStorage.getItem('cordoval_quiz_guidance') || '');
  const [questionTypes, setQuestionTypes] = useState('Multiple Choice');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [count, setCount] = useState('10');
  const [includeKey, setIncludeKey] = useState(true);

  useEffect(() => {
//     localStorage.setItem('cordoval_quiz_topic', topic);
//     localStorage.setItem('cordoval_quiz_guidance', guidance);
  }, [topic, guidance]);

  const handleSave = () => {
    const backup = { topic, guidance, questionTypes, difficulty, count, includeKey };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "quiz_creator_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.topic !== undefined) setTopic(parsed.topic);
        if (parsed.guidance !== undefined) setGuidance(parsed.guidance);
        if (parsed.questionTypes !== undefined) setQuestionTypes(parsed.questionTypes);
        if (parsed.difficulty !== undefined) setDifficulty(parsed.difficulty);
        if (parsed.count !== undefined) setCount(parsed.count);
      } catch (err) {
        alert("Invalid file format");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };
  const [isGenerating, setIsGenerating] = useState(false);
  const [sourceFile, setSourceFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSourceFile(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const generateQuiz = async () => {
    if (!topic) return;
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const prompt = `
        You are "The Quiz & Assessment Creator", an expert educator and instructional designer.
        
        TASK: Create a professional quiz or assessment.
        
        INPUTS:
        - TOPIC/LESSON TITLE: ${topic}
        - GUIDANCE: ${guidance || 'None'}
        - QUESTION TYPES: ${questionTypes}
        - DIFFICULTY LEVEL: ${difficulty}
        - QUESTION COUNT: ${count}
        - INCLUDE ANSWER KEY: ${includeKey}
        - SOURCE DATA: ${sourceFile || 'None'}
        
        REQUIREMENTS:
        1. Clear Instructions
        2. Numbered Questions (with distractors for multiple choice)
        3. Grading Rubric
        4. If includeKey is true, generate a separate "Teacher's Key" at the bottom.
        5. Perfectly formatted for print or digital distribution.
        
        OUTPUT FORMAT: Return a JSON object:
        {
          "title": "Assessment: [Topic]",
          "content": "Full Markdown formatted quiz."
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are an expert educator. Return valid JSON only."
        }
      });

      const result = JSON.parse(response.text || "{}");
      
      const doc: Document = {
        id: Math.random().toString(36).substr(2, 9),
        name: result.title || `Quiz - ${topic.slice(0, 20)}`,
        content: result.content || "No content generated.",
        updatedAt: Date.now(),
        tags: ['quiz', 'assessment', 'education'],
        folderId: null,
        history: []
      };
      onSaveDoc(doc);
      onNavigate('docs', doc.id);

    } catch (error) {
      console.error("Quiz generation failed:", error);
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#020617] overflow-hidden">
      <div className="bg-slate-900/50 border-b border-white/5 px-8 py-4 flex items-center justify-between shrink-0 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-xl transition-all">
            <ArrowLeft size={20} className="text-slate-400" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center text-purple-500 shadow-lg shadow-purple-500/10">
              <GraduationCap size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black text-white uppercase tracking-tight italic">The Quiz Creator</h1>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Assessment Architect</p>
            </div>
          </div>
        </div>
        <SaveLoadControls onSave={handleSave} onLoad={handleLoad} label="Quiz" compact />
      </div>

      <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
          <section className="bg-slate-900/30 rounded-[2.5rem] p-10 border border-white/5 space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Topic or Lesson Title</label>
              <input 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Introduction to Quantum Computing"
                className="w-full px-8 py-6 bg-slate-950 border border-white/5 rounded-3xl focus:border-purple-500/50 outline-none transition-all text-lg font-bold text-white placeholder:text-slate-800"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Strategic Guidance (Optional)</label>
              <textarea 
                value={guidance}
                onChange={(e) => setGuidance(e.target.value)}
                placeholder="e.g., Make the questions tricky or focus on the second half of the material..."
                className="w-full px-8 py-6 bg-slate-950 border border-white/5 rounded-3xl focus:border-purple-500/50 outline-none transition-all text-sm font-medium text-slate-300 placeholder:text-slate-800 min-h-[100px] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Question Types</label>
                <select 
                  value={questionTypes}
                  onChange={(e) => setQuestionTypes(e.target.value)}
                  className="w-full px-8 py-4 bg-slate-950 border border-white/5 rounded-2xl focus:border-purple-500/50 outline-none transition-all text-sm font-bold text-white appearance-none"
                >
                  <option>Multiple Choice</option>
                  <option>True/False</option>
                  <option>Short Answer</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Difficulty Level</label>
                <select 
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-8 py-4 bg-slate-950 border border-white/5 rounded-2xl focus:border-purple-500/50 outline-none transition-all text-sm font-bold text-white appearance-none"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Expert</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Question Count</label>
                <select 
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="w-full px-8 py-4 bg-slate-950 border border-white/5 rounded-2xl focus:border-purple-500/50 outline-none transition-all text-sm font-bold text-white appearance-none"
                >
                  <option>5</option>
                  <option>10</option>
                  <option>20</option>
                </select>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => setIncludeKey(!includeKey)}
                  className={`w-full p-6 rounded-3xl border-2 transition-all flex items-center justify-between ${includeKey ? 'border-purple-500 bg-purple-500/5 text-white' : 'border-white/5 text-slate-500 hover:border-white/10'}`}
                >
                  <div className="flex items-center gap-4">
                    <Key size={20} className={includeKey ? 'text-purple-500' : 'text-slate-600'} />
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest">Teacher's Key</p>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Include Answer Key at bottom</p>
                    </div>
                  </div>
                  {includeKey && <CheckCircle2 size={16} className="text-purple-500" />}
                </button>
              </div>
            </div>
          </section>

          <section className="bg-slate-900/30 rounded-[2.5rem] p-10 border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center">
                  <Upload size={18} />
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-white uppercase tracking-tight">Source Material</h3>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">Book chapters, lecture transcripts, or articles</p>
                </div>
              </div>
              {fileName && (
                <button onClick={() => { setSourceFile(null); setFileName(null); }} className="text-rose-500 hover:text-rose-600">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="relative">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`w-full py-16 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all ${fileName ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/5 bg-slate-950/50 hover:bg-slate-950 hover:border-white/10'}`}>
                {fileName ? (
                  <>
                    <CheckCircle2 size={40} className="text-purple-500" />
                    <div className="text-center">
                      <p className="text-sm font-black text-white">{fileName}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Lesson Data Ingested</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload size={40} className="text-slate-800" />
                    <div className="text-center">
                      <p className="text-sm font-black text-slate-400">Drop lesson material here</p>
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">PDF, TXT, or DOCX supported</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          <button 
            onClick={generateQuiz}
            disabled={!topic || isGenerating}
            className={`w-full h-24 rounded-[2.5rem] flex items-center justify-center gap-4 transition-all ${!topic || isGenerating ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-purple-500 text-white hover:bg-purple-400 shadow-2xl shadow-purple-500/20 active:scale-95'}`}
          >
            {isGenerating ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                <span className="text-sm font-black uppercase tracking-[0.3em]">Extracting Facts...</span>
              </>
            ) : (
              <>
                <Sparkles size={24} />
                <span className="text-sm font-black uppercase tracking-[0.3em]">Generate Assessment</span>
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>

      {isGenerating && (
        <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-8 animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-purple-500/10 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <ListChecks size={32} className="absolute inset-0 m-auto text-purple-500 animate-bounce" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Generating Distractors...</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Gemini is crafting tricky questions</p>
          </div>
        </div>
      )}
    </div>
  );
};
