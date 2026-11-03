import React from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 w-full">
          <div className="max-w-md w-full rounded-2xl bg-[#111424]/90 border border-white/10 backdrop-blur-xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-[#ff5a36]/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Reload the arena.
            </p>

            {this.state.error?.message && (
              <div className="mb-6 p-3 rounded-xl bg-black/40 border border-white/5 text-left text-xs font-mono text-red-300 max-h-24 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-[#ff5a36] to-[#ff7455] hover:from-[#ff6744] hover:to-[#ff8568] text-white shadow-lg shadow-[#ff5a36]/25 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Arena
              </button>
              <Link
                to="/exercises"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Exercises
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
