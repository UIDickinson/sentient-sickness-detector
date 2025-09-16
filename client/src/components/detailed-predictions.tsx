import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, AlertTriangle } from "lucide-react";
import type { Prediction } from "@shared/schema";

interface DetailedPredictionsProps {
  predictions: Prediction[];
}

export function DetailedPredictions({ predictions }: DetailedPredictionsProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!predictions || predictions.length === 0) {
    return null;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'emergency': return 'text-destructive bg-destructive/10';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-secondary bg-secondary/10';
      case 'low': return 'text-accent bg-accent/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return 'bg-secondary';
    if (confidence >= 0.5) return 'bg-accent';
    return 'bg-muted-foreground';
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-1">Detailed Analysis</h3>
          <p className="text-muted-foreground">Technical details from our machine learning model</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center space-x-2 text-primary hover:text-primary/80 font-medium transition-colors"
          data-testid="button-toggle-details"
        >
          <span>{showDetails ? 'Hide Details' : 'View Details'}</span>
          <ChevronDown 
            className={`w-4 h-4 transform transition-transform ${showDetails ? 'rotate-180' : ''}`} 
          />
        </Button>
      </div>

      {showDetails && (
        <div className="space-y-4" data-testid="detailed-predictions">
          {predictions.map((prediction, index) => (
            <div 
              key={`${prediction.disease}-${index}`}
              className="border border-border rounded-lg p-4 bg-muted/50"
              data-testid={`prediction-${prediction.disease.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-foreground">{prediction.disease}</h4>
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(prediction.severity)}`}>
                    {Math.round(prediction.confidence * 100)}% confidence
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${getConfidenceColor(prediction.confidence)}`}
                    style={{ width: `${prediction.confidence * 100}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {prediction.description}
              </p>
              <div className="text-sm">
                <span className="font-medium text-foreground">Recommended action:</span>
                <span 
                  className={`ml-1 ${
                    prediction.severity === 'emergency' ? 'text-destructive font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {prediction.action}
                </span>
              </div>
            </div>
          ))}

          {/* Medical Disclaimer */}
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground mb-2">Important Medical Disclaimer</h4>
                <p className="text-sm text-muted-foreground">
                  This AI assessment is for informational purposes only and should not replace professional veterinary care. 
                  Always consult with a qualified veterinarian for proper diagnosis and treatment of your pet's health concerns.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
