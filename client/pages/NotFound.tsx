import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="text-center space-y-6">
        <div className="text-8xl font-bold text-primary/50">404</div>
        <h1 className="text-4xl font-bold">Page Not Found</h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Sorry, the page you're looking for doesn't exist. It might have been moved or deleted.
        </p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/dashboard">
            <Button size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <Link to="/pos">
            <Button variant="outline" size="lg">
              Go to POS
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
