import React, { useRef } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };
    
    const handleCommand = (command: string) => {
        document.execCommand(command, false);
        if (editorRef.current) {
            editorRef.current.focus();
        }
        handleInput(); // Make sure to update state after command
    };

    return (
        <div className="mt-1 border border-gray-300 rounded-md shadow-sm">
            <div className="p-2 bg-slate-50 border-b border-gray-300 rounded-t-md">
                 <button type="button" onClick={() => handleCommand('bold')} className="px-2 py-1 text-sm font-bold text-slate-700 hover:bg-slate-200 rounded">B</button>
                 <button type="button" onClick={() => handleCommand('italic')} className="px-2 py-1 text-sm italic text-slate-700 hover:bg-slate-200 rounded">I</button>
                 <button type="button" onClick={() => handleCommand('underline')} className="px-2 py-1 text-sm underline text-slate-700 hover:bg-slate-200 rounded">U</button>
            </div>
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                dangerouslySetInnerHTML={{ __html: value }}
                className="block w-full p-2 min-h-[150px] focus:outline-none"
            />
        </div>
    );
};

export default RichTextEditor;
