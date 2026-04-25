import { memo } from "react";

interface LoadingPhaseProps {
  error?: string | null;
  onHome?: () => void;
}

function LoadingPhase({ error, onHome }: LoadingPhaseProps) {
  return (
    <div className="min-h-screen bg-bg text-tx flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-[15px] text-tx2 mb-4">An error occured, please refresh and try again.</p>
            <p className="text-[13px] text-tx3 mb-6 max-w-[420px] mx-auto">{error}</p>
            {onHome && (
              <button
                onClick={onHome}
                className="bg-sf2 border border-bdr rounded-md text-tx2 text-xs px-3 py-[5px] cursor-pointer"
              >
                Back to Home
              </button>
            )}
          </>
        ) : (
          <p className="text-[15px] text-tx3">Loading Questions…</p>
        )}
      </div>
    </div>
  );
}

export default memo(LoadingPhase);
