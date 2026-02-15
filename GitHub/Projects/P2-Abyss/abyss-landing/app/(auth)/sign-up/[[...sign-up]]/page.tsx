import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex justify-center">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'w-full',
            card: 'bg-transparent shadow-none',
            headerTitle: 'text-white',
            headerSubtitle: 'text-cyan-200',
            socialButtonsBlockButton: 'bg-white/10 border-white/20 text-white hover:bg-white/20',
            formButtonPrimary: 'bg-cyan-500 hover:bg-cyan-600 text-white',
            formFieldInput: 'bg-white/10 border-white/20 text-white placeholder:text-white/50',
            footerActionLink: 'text-cyan-300 hover:text-cyan-200',
            identityPreviewText: 'text-white',
            formFieldLabel: 'text-white',
            dividerLine: 'bg-white/20',
            dividerText: 'text-white/70',
            formFieldInputShowPasswordButton: 'text-white/70',
            otpCodeFieldInput: 'bg-white/10 border-white/20 text-white',
            formResendCodeLink: 'text-cyan-300 hover:text-cyan-200',
          },
        }}
      />
    </div>
  );
}
