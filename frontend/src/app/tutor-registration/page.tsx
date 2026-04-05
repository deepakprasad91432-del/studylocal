import { auth0 } from '@/lib/auth0';
import TutorRegistrationForm from './TutorRegistrationForm';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Register as Tutor | StudyLocal',
};

export default async function TutorRegistrationPage() {
    const session = await auth0.getSession();
    const user = session?.user;

    if (!user) {
        redirect('/api/auth/login?returnTo=/tutor-registration');
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-3 duration-500">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 tracking-tight mb-3 px-2">
                        Become a Tutor
                    </h1>
                    <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-medium">
                        Join our community of local educators. Help students in your neighbourhood excel while growing your independent teaching business.
                    </p>
                </div>

                <TutorRegistrationForm user={user} />
            </div>
        </div>
    );
}
