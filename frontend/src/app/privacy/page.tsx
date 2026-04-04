import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, EyeOff, Scale } from 'lucide-react';

export const metadata = {
    title: 'Privacy Policy | StudyLocal',
    description: 'Our commitment to protecting your data and privacy.',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-100 py-12">
                <div className="max-w-4xl mx-auto px-6">
                    <Link 
                        href="/" 
                        className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-lg text-gray-500">
                        Last updated: April 5, 2026
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-12">
                        <section id="introduction">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <ShieldCheck className="w-6 h-6 text-green-600" />
                                1. Introduction
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                Welcome to StudyLocal. We value your privacy and are committed to protecting your personal data. 
                                This policy explains how we handle your information when you use our platform to find or offer tutoring services.
                            </p>
                        </section>

                        <section id="data-collection">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Lock className="w-6 h-6 text-green-600" />
                                2. Information We Collect
                            </h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                We collect information that you provide directly to us when creating an account, registering as a tutor, or communicating with other users:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-600">
                                <li>Account details (Name, Email, Profile Picture via Auth0)</li>
                                <li>Tutor profile information (Subjects, Location, Biography, Education)</li>
                                <li>Communication data (Chat messages sent through our platform)</li>
                            </ul>
                        </section>

                        <section id="data-usage">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <EyeOff className="w-6 h-6 text-green-600" />
                                3. How We Use Your Data
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                We use your data to provide our core services: connecting students with local tutors. 
                                We do not sell your personal information to third parties. Your location is used only 
                                to show you nearby tutors or to show students that you are available in their area.
                            </p>
                        </section>

                        <section id="data-sharing">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Scale className="w-6 h-6 text-green-600" />
                                4. Your Rights
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                You have the right to access, update, or delete your personal information at any time. 
                                Tutors can manage their visibility and profile details through their personal dashboard.
                            </p>
                        </section>
                    </div>

                    {/* Sidebar / Highlights */}
                    <div className="space-y-8">
                        <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                            <h3 className="font-bold text-green-900 mb-2">Key Highlight</h3>
                            <p className="text-sm text-green-800 leading-relaxed">
                                StudyLocal is commission-free. We only facilitate the connection. We do not process payments or store bank details.
                            </p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-2">Need Help?</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                If you have questions about your privacy, contact our team.
                            </p>
                            <Link 
                                href="/complaints" 
                                className="text-sm font-bold text-green-600 hover:text-green-700 transition-colors"
                            >
                                Contact Support →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
