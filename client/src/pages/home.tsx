import { useState } from "react";
import dobbyImg from '../../../attached_asset/dobby64.png';
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SymptomInput } from "@/components/symptom-input";
import { ChatInterface } from "@/components/chat-interface";
import { DetailedPredictions } from "@/components/detailed-predictions";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { DiagnosisResponse, Prediction } from "@shared/schema";

export default function Home() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResponse | null>(null);
  const { toast } = useToast();

  const diagnosisMutation = useMutation({
    mutationFn: (symptoms: string[]) => api.diagnose(symptoms),
    onSuccess: (data) => {
      setDiagnosisResult(data);
      toast({
        title: "Analysis Complete",
        description: "Your dog's symptoms have been analyzed successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Diagnosis error:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Unable to analyze symptoms. Please try again.",
        variant: "destructive",
      });
    },
  });

  const followUpMutation = useMutation({
    mutationFn: (question: string) => 
      api.followUp(selectedSymptoms, diagnosisResult?.predictions || [], question),
    onSuccess: (data) => {
      if (diagnosisResult) {
        setDiagnosisResult({
          ...diagnosisResult,
          chatResponse: data.chatResponse
        });
      }
    },
    onError: (error: any) => {
      console.error("Follow-up error:", error);
      toast({
        title: "Follow-up Failed",
        description: error.message || "Unable to process your question. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDiagnose = async () => {
    if (selectedSymptoms.length === 0) {
      toast({
        title: "No Symptoms Selected",
        description: "Please select at least one symptom before getting an assessment.",
        variant: "destructive",
      });
      return;
    }

    diagnosisMutation.mutate(selectedSymptoms);
  };

  const handleFollowUp = async (question: string) => {
    await followUpMutation.mutateAsync(question);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-8 mb-8">
          <div className="text-center">
            <img 
              src={dobbyImg}
              alt="Dobby mascot dog portrait" 
              className="w-32 h-24 object-cover rounded-xl mx-auto mb-6 shadow-md"
              data-testid="img-welcome-dog"
            />
            <h2 className="text-3xl font-bold text-foreground mb-4">How is your dog feeling today?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Describe your dog's symptoms and get AI-powered insights from our veterinary assessment tool. 
              Remember, this is for guidance only - always consult your veterinarian for proper medical care.
            </p>
          </div>
        </div>

        {/* Symptom Input */}
        <SymptomInput
          selectedSymptoms={selectedSymptoms}
          onSymptomsChange={setSelectedSymptoms}
          onDiagnose={handleDiagnose}
          isLoading={diagnosisMutation.isPending}
        />

        {/* Chat Interface */}
        {diagnosisResult && (
          <ChatInterface
            chatResponse={diagnosisResult.chatResponse}
            predictions={diagnosisResult.predictions}
            symptoms={selectedSymptoms}
            onFollowUp={handleFollowUp}
            isLoading={followUpMutation.isPending}
          />
        )}

        {/* Detailed Predictions */}
        {diagnosisResult && (
          <DetailedPredictions predictions={diagnosisResult.predictions} />
        )}
      </main>

      <Footer />
    </div>
  );
}
