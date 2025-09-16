export function Footer() {
  return (
    <footer className="bg-muted border-t border-border mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-foreground mb-4">Emergency Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-emergency-vet">Find Emergency Vet</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-poison-control">Pet Poison Control</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-first-aid">First Aid Guide</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Health Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-vaccination">Vaccination Schedule</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-preventive-care">Preventive Care</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-common-conditions">Common Conditions</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">About This Tool</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-how-it-works">How It Works</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-data-sources">Data Sources</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-privacy">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Dog Symptom Checker. This tool is for educational purposes only. Always consult your veterinarian for medical advice.</p>
        </div>
      </div>
    </footer>
  );
}
