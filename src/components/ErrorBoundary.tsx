import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Shazo ErrorBoundary Caught Error]:", error, errorInfo);
  }

  private handleClearSession = () => {
    localStorage.removeItem("shazo_admin_token");
    localStorage.removeItem("shazo_admin_user");
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020B18] flex flex-col items-center justify-center p-6 text-slate-100 select-none">
          <div className="w-full max-w-md bg-[#061B35] rounded-2xl border border-rose-500/20 p-8 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center text-2xl mx-auto border border-rose-500/20">
              ⚠️
            </div>
            
            <div className="space-y-2">
              <h1 className="text-xl font-black text-rose-400 tracking-tight">Dashboard failed to render</h1>
              <p className="text-slate-400 text-xs">
                A critical runtime error was caught preventing the visual frames from loading correctly.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950/80 p-4 border border-[#ffffff0a] rounded-xl text-left text-xs font-mono text-rose-300 max-h-32 overflow-y-auto break-all">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <button
              onClick={this.handleClearSession}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black tracking-widest uppercase text-xs rounded-xl py-3.5 shadow-lg shadow-rose-950/40 transition cursor-pointer"
            >
              Clear session and reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

