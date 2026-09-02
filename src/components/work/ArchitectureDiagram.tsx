interface FlowDiagramProps {
  steps: string[];
  title?: string;
}

interface LayerDiagramProps {
  layers: string[];
  title?: string;
}

export function FlowDiagram({ steps, title }: FlowDiagramProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 md:p-8">
      {title && (
        <p className="mb-6 font-mono text-xs uppercase text-muted-foreground">{title}</p>
      )}
      <div className="flex flex-col items-center gap-0">
        {steps.map((step, index) => (
          <div key={step} className="flex w-full flex-col items-center">
            <div className="w-full max-w-xs rounded-lg border border-border bg-muted/30 px-4 py-3 text-center text-sm font-medium">
              {step}
            </div>
            {index < steps.length - 1 && (
              <div className="flex flex-col items-center py-1">
                <div className="h-4 w-px bg-border" />
                <svg
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  className="text-muted-foreground"
                  aria-hidden
                >
                  <path d="M6 8L0 0h12L6 8z" fill="currentColor" opacity="0.4" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LayerDiagram({ layers, title }: LayerDiagramProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 md:p-8">
      {title && (
        <p className="mb-6 font-mono text-xs uppercase text-muted-foreground">{title}</p>
      )}
      <div className="space-y-2">
        {layers.map((layer: string, index: number) => (
          <div
            key={layer}
            className="rounded-lg border border-border px-4 py-3 text-center text-sm font-medium transition-colors"
            style={{
              opacity: 1 - index * 0.08,
              marginLeft: `${index * 12}px`,
              marginRight: `${index * 12}px`,
            }}
          >
            {layer}
          </div>
        ))}
      </div>
    </div>
  );
}
