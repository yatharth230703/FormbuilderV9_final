
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Coins, CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreditsDisplayProps {
  className?: string;
}

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
}

const creditPackages: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 10,
    price: 5,
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 25,
    price: 10,
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    credits: 80,
    price: 20,
  },
];

export function CreditsDisplay({ className }: CreditsDisplayProps) {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/user/credits');
      if (response.ok) {
        const data = await response.json();
        console.log('Credits API response:', data);
        setCredits(data.credits);
      } else {
        console.error('Credits API failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageId: string) => {
    setPurchasing(packageId);
    try {
      const response = await fetch('/api/purchase-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ package: packageId }),
      });

      if (response.ok) {
        const { sessionId } = await response.json();
        
        // Redirect to Stripe Checkout
        const stripe = (window as any).Stripe('pk_test_your_publishable_key_here'); // Replace with your actual publishable key
        const { error } = await stripe.redirectToCheckout({ sessionId });
        
        if (error) {
          console.error('Stripe error:', error);
          toast({
            title: 'Payment Error',
            description: 'There was an error processing your payment. Please try again.',
            variant: 'destructive',
          });
        }
      } else {
        const errorData = await response.json();
        toast({
          title: 'Purchase Error',
          description: errorData.error || 'Failed to initiate purchase',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error initiating purchase:', error);
      toast({
        title: 'Purchase Error',
        description: 'Failed to initiate purchase. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className={className}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
        <Coins className="h-4 w-4 text-yellow-600" />
        <span>{credits} credits</span>
      </div>
      
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <CreditCard className="h-3 w-3 mr-1" />
            Buy Credits
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Purchase Credits</DialogTitle>
            <DialogDescription>
              Choose a package to purchase form creation credits
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {creditPackages.map((pkg) => (
              <Card 
                key={pkg.id} 
                className={`relative ${pkg.popular ? 'border-primary' : ''}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle>{pkg.name}</CardTitle>
                  <div className="text-3xl font-bold">${pkg.price}</div>
                  <CardDescription>{pkg.credits} Credits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center text-sm text-muted-foreground">
                    ${(pkg.price / pkg.credits).toFixed(2)} per credit
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={purchasing === pkg.id}
                    variant={pkg.popular ? 'default' : 'outline'}
                  >
                    {purchasing === pkg.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Purchase ${pkg.credits} Credits`
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>• Each form creation or edit costs 1 credit</p>
            <p>• Credits never expire</p>
            <p>• Secure payment powered by Stripe</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
