import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import { FirebaseError } from 'firebase/app';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema)
  });

  async function onSubmit(data: SignupForm) {
    try {
      setLoading(true);
      await signup(data.email, data.password);
      toast({
        title: "Account created successfully!",
        description: "Please check your email for verification.",
      });
      navigate('/verify-email');
    } catch (error) {
      let errorMessage = "Failed to create an account.";
      
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = "This email is already registered.";
            break;
          case 'auth/invalid-email':
            errorMessage = "Invalid email address.";
            break;
          case 'auth/operation-not-allowed':
            errorMessage = "Email/password accounts are not enabled. Please contact support.";
            break;
          case 'auth/weak-password':
            errorMessage = "Password is too weak. Please use a stronger password.";
            break;
          default:
            console.error('Signup error:', error);
        }
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-xl">
        <div className="text-center mb-8">
          <Logo className="inline-block mb-4" />
          <h2 className="text-3xl font-bold text-white">Create Account</h2>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              {...register('email')}
              type="email"
              placeholder="Email"
              className="bg-gray-700 text-white border-gray-600"
              disabled={loading}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <Input
              {...register('password')}
              type="password"
              placeholder="Password"
              className="bg-gray-700 text-white border-gray-600"
              disabled={loading}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Input
              {...register('confirmPassword')}
              type="password"
              placeholder="Confirm Password"
              className="bg-gray-700 text-white border-gray-600"
              disabled={loading}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>
      </div>
    </div>
  );
}