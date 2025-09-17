// sentientService.ts
import { type Prediction } from '@shared/schema';

export class FireworksAIService {
  private endpoint = 'https://api.fireworks.ai/inference/v1/chat/completions';
  private model = 'accounts/sentientfoundation-serverless/models/dobby-mini-unhinged-plus-llama-3-1-8b';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.FIREWORKS_API_KEY || '';
    if (!this.apiKey) {
      throw new Error("FIREWORKS_API_KEY environment variable is required");
    }
  }

  private async callAPI(messages: { role: string, content: string }[], maxTokens = 500, temperature = 0.7) {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: maxTokens,
          top_p: 1,
          top_k: 40,
          presence_penalty: 0,
          frequency_penalty: 0,
          temperature,
          messages
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content || null;
    } catch (error) {
      console.error("Sentient AI API error:", error);
      throw error;
    }
  }

  /**
   * Generate conversational response from ML predictions
   */
  async generateChatResponse(symptoms: string[], predictions: Prediction[], followUpQuestion?: string): Promise<string> {
    try {
      if (followUpQuestion) {
        return await this.handleFollowUpQuestion(symptoms, predictions, followUpQuestion);
      }

      const systemPrompt = `You are a compassionate veterinary AI assistant helping dog owners understand their pet's symptoms. 
      Your role is to translate technical medical predictions into friendly, empathetic language that regular dog owners can understand.
      
      Guidelines:
      - Be empathetic and understanding - pet owners are worried about their dogs
      - Use plain English, avoid medical jargon
      - Always emphasize that this is guidance only and veterinary care is essential
      - For emergency conditions, stress urgency clearly but calmly
      - Provide practical next steps
      - Be reassuring when appropriate, but never downplay serious conditions
      
      Respond in a warm, professional tone as if speaking directly to a concerned dog owner.`;

      const topPredictions = predictions.slice(0, 3);

      const userPrompt = `The dog owner reported these symptoms: ${symptoms.join(', ')}

      Based on our analysis, here are the most likely conditions:
      ${topPredictions.map((p, i) => 
        `${i + 1}. ${p.disease} (${Math.round(p.confidence * 100)}% confidence)
           - ${p.description}
           - Recommended action: ${p.action}`
      ).join('\n')}

      Please provide a compassionate, clear response that:
      1. Acknowledges the owner's concern
      2. Explains the most likely condition(s) in simple terms
      3. Provides clear next steps
      4. Includes any immediate care advice if appropriate
      5. Emphasizes the importance of professional veterinary care

      Keep the response concise but thorough (2-3 paragraphs).`;

      return await this.callAPI(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        500,
        0.7
      ) || "I apologize, but I'm unable to provide an assessment at this time. Please consult with your veterinarian directly.";

    } catch (error) {
      console.error("Sentient AI API error:", error);
      return "I'm experiencing technical difficulties right now. For your dog's safety, please contact your veterinarian directly to discuss these symptoms.";
    }
  }

  /**
   * Handle follow-up questions from users
   */
  private async handleFollowUpQuestion(symptoms: string[], predictions: Prediction[], question: string): Promise<string> {
    try {
      const systemPrompt = `You are a veterinary AI assistant answering follow-up questions about a dog's symptoms and diagnosis.
      
      Context: The dog has these symptoms: ${symptoms.join(', ')}
      Most likely conditions: ${predictions.slice(0, 3).map(p => `${p.disease} (${Math.round(p.confidence * 100)}%)`).join(', ')}
      
      Guidelines:
      - Answer the specific question asked
      - Stay within the context of the provided symptoms and diagnosis
      - Be helpful but always defer to professional veterinary advice for medical decisions
      - If asked about treatment, emphasize veterinary consultation
      - If asked about emergency signs, be clear and specific
      - Keep responses concise and actionable`;

      return await this.callAPI(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
        300,
        0.6
      ) || "I recommend discussing this specific question with your veterinarian for the most accurate guidance.";

    } catch (error) {
      console.error("Sentient AI API error:", error);
      return "I'm unable to answer that question right now. Please contact your veterinarian for specific guidance about your dog's condition.";
    }
  }

  /**
   * Generate empathetic response for emergency conditions
   */
  async generateEmergencyResponse(symptoms: string[], emergencyCondition: string): Promise<string> {
    const systemPrompt = `You are providing urgent guidance for a potential veterinary emergency. Be calm but clear about the urgency.`;

    const userPrompt = `A dog has symptoms: ${symptoms.join(', ')} which may indicate ${emergencyCondition}. 
    Provide a calm but urgent response telling the owner to seek immediate veterinary care. Include what to do while getting to the vet.`;

    try {
      return await this.callAPI(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        200,
        0.3
      ) || `Based on these symptoms, please seek immediate veterinary care for ${emergencyCondition}. Contact your emergency vet or animal hospital right away.`;

    } catch (error) {
      console.error("Sentient AI API error:", error);
      return `These symptoms require immediate veterinary attention. Please contact your emergency veterinarian or animal hospital right away.`;
    }
  }
}

export const fireworksService = new FireworksAIService();
