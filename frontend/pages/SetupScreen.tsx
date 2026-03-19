
import React from 'react';

const SetupScreen: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6">
            <div className="max-w-2xl w-full space-y-8 text-center">
                <div className="w-24 h-24 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-600/20 shadow-2xl">
                    <span className="material-icons-round text-5xl text-blue-500 animate-pulse">settings</span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase">
                    Setup <span className="text-blue-500">Required</span>
                </h1>

                <p className="text-slate-400 text-lg leading-relaxed max-w-lg mx-auto">
                    The application has been successfully restructured, but it requires a connection to your Supabase project to function.
                </p>

                <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 text-left space-y-6 mt-8">
                    <div className="flex gap-4">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">1</div>
                        <div>
                            <h3 className="font-bold text-white">Create Supabase Project</h3>
                            <p className="text-slate-500 text-sm mt-1">Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">supabase.com</a> and create a new project.</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">2</div>
                        <div>
                            <h3 className="font-bold text-white">Run Database Scripts</h3>
                            <p className="text-slate-500 text-sm mt-1">Located in <code className="bg-black/30 px-2 py-1 rounded text-blue-300">backend/schema.sql</code> and <code className="bg-black/30 px-2 py-1 rounded text-blue-300">backend/seed.sql</code>.</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">3</div>
                        <div>
                            <h3 className="font-bold text-white">Update Environment Variables</h3>
                            <p className="text-slate-500 text-sm mt-1">Open <code className="bg-black/30 px-2 py-1 rounded text-blue-300">frontend/.env</code> and add your Project URL and Anon Key.</p>
                        </div>
                    </div>
                </div>

                <div className="pt-8">
                    <p className="text-slate-500 text-sm uppercase tracking-widest font-bold">
                        After updating .env, restart the server
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SetupScreen;
