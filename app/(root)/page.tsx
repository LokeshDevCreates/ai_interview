import InterviewCard from '@/components/InterviewCard'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewsByUserId, getLatestInterviews } from "@/lib/actions/general.action";

const Page = async () => {
    const user = await getCurrentUser();

    // If user is not logged in, show landing page
    if (!user?.id) {
        return (
            <>
                {/* Hero Section */}
                <section className='card-cta'>
                    <div className='flex flex-col gap-6 max-w-2xl'>
                        <h1 className='text-5xl font-bold leading-tight max-sm:text-4xl'>
                            Master Your Interview Skills with AI-Powered Practice
                        </h1>
                        <p className='text-xl text-gray-300 max-sm:text-lg'>
                            Practice real interview questions, get instant AI feedback, and boost your confidence. 
                            Create custom interviews for any role and track your progress.
                        </p>
                        <div className='flex flex-row gap-4 max-sm:flex-col'>
                            <Button asChild className='btn-primary'>
                                <Link href='/sign-up'>
                                    Get Started Free
                                </Link>
                            </Button>
                            <Button asChild className='btn-secondary'>
                                <Link href='/sign-in'>
                                    Sign In
                                </Link>
                            </Button>
                        </div>
                    </div>
                    <Image 
                        src='/robot.png' 
                        width={400} 
                        height={400} 
                        alt='AI Interview Assistant' 
                        className='max-sm:hidden'
                    />
                </section>

                {/* Features Section */}
                <section className='flex flex-col gap-8 mt-16'>
                    <div className='text-center'>
                        <h2 className='text-4xl font-bold mb-4'>How It Works</h2>
                        <p className='text-gray-300 text-lg'>Everything you need to ace your next interview</p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-8'>
                        {/* Feature 1 */}
                        <div className='flex flex-col gap-4 p-6 rounded-lg bg-dark-200 border border-dark-300'>
                            <div className='w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center'>
                                <span className='text-2xl'>🎯</span>
                            </div>
                            <h3 className='text-xl font-semibold'>Create Custom Interviews</h3>
                            <p className='text-gray-400'>
                                Generate tailored interview questions for any role, tech stack, or industry. 
                                Practice exactly what you need.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className='flex flex-col gap-4 p-6 rounded-lg bg-dark-200 border border-dark-300'>
                            <div className='w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center'>
                                <span className='text-2xl'>🎤</span>
                            </div>
                            <h3 className='text-xl font-semibold'>Real-Time AI Interviews</h3>
                            <p className='text-gray-400'>
                                Experience realistic interview simulations with our AI interviewer. 
                                Practice your responses naturally.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className='flex flex-col gap-4 p-6 rounded-lg bg-dark-200 border border-dark-300'>
                            <div className='w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center'>
                                <span className='text-2xl'>📊</span>
                            </div>
                            <h3 className='text-xl font-semibold'>Detailed Feedback & Reports</h3>
                            <p className='text-gray-400'>
                                Get comprehensive analysis of your performance with scores, strengths, 
                                and areas for improvement.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className='flex flex-col gap-8 mt-16 p-8 rounded-lg bg-gradient-to-r from-primary-100/10 to-primary-200/10 border border-primary-100/20'>
                    <div className='text-center'>
                        <h2 className='text-4xl font-bold mb-4'>Why Choose PracticePitch?</h2>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className='flex flex-row gap-4 items-start'>
                            <span className='text-2xl'>✅</span>
                            <div>
                                <h3 className='text-lg font-semibold mb-2'>Unlimited Practice</h3>
                                <p className='text-gray-400'>Practice as many times as you want without pressure</p>
                            </div>
                        </div>

                        <div className='flex flex-row gap-4 items-start'>
                            <span className='text-2xl'>✅</span>
                            <div>
                                <h3 className='text-lg font-semibold mb-2'>AI-Powered Feedback</h3>
                                <p className='text-gray-400'>Get instant, objective feedback on every response</p>
                            </div>
                        </div>

                        <div className='flex flex-row gap-4 items-start'>
                            <span className='text-2xl'>✅</span>
                            <div>
                                <h3 className='text-lg font-semibold mb-2'>Track Your Progress</h3>
                                <p className='text-gray-400'>Monitor improvement over time with detailed analytics</p>
                            </div>
                        </div>

                        <div className='flex flex-row gap-4 items-start'>
                            <span className='text-2xl'>✅</span>
                            <div>
                                <h3 className='text-lg font-semibold mb-2'>Role-Specific Questions</h3>
                                <p className='text-gray-400'>Questions tailored to your target position and industry</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className='flex flex-col gap-6 mt-16 text-center items-center'>
                    <h2 className='text-4xl font-bold'>Ready to Ace Your Next Interview?</h2>
                    <p className='text-gray-300 text-lg max-w-2xl'>
                        Join thousands of professionals who have improved their interview skills with PracticePitch
                    </p>
                    <Button asChild className='btn-primary text-lg px-8 py-6'>
                        <Link href='/sign-up'>
                            Start Practicing Now - It&apos;s Free
                        </Link>
                    </Button>
                </section>
            </>
        );
    }

    // If user is logged in, show dashboard
    const [userInterviews, latestInterviews] = await Promise.all([
        getInterviewsByUserId(user.id),
        getLatestInterviews({ userId: user.id })
    ]);

    const hasPastInterviews = userInterviews && userInterviews.length > 0;
    const hasUpcomingInterviews = latestInterviews && latestInterviews.length > 0;

    return (
        <>
            <section className='card-cta'>
                <div className='flex flex-col gap-6 max-w-lg'>
                    <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
                    <p className='text-lg'>
                        Practice on real interview questions & get instant feedback.
                    </p>
                    <Button asChild className='btn-primary max-sm:w-full'>
                        <Link href='/interview'>
                            Start an Interview
                        </Link>
                    </Button>
                </div>
                <Image src='/robot.png' width={400} height={400} alt='robot' className='max-sm:hidden' />
            </section>

            <section className='flex flex-col gap-6 mt-8'>
                <h2>Your Interviews</h2>

                <div className='interviews-section'>
                    {hasPastInterviews ? (
                        userInterviews.map((interview) => (
                            <InterviewCard {...interview} key={interview.id} />
                        ))
                    ) : (
                        <p>You haven&apos;t taken any interviews yet</p>
                    )}
                </div>
            </section>

            <section className='flex flex-col gap-6 mt-8'>
                <h2>Take an Interview</h2>
                <div className='interviews-section'>
                {hasUpcomingInterviews ? (
                    latestInterviews.map((interview) => (
                        <InterviewCard 
                            {...interview} 
                            userId={user.id}   // ✅ override with logged-in user's id
                            key={interview.id} 
                        />
                    ))
                ) : (
                    <p>There are no new interviews available</p>
                )}
                </div>
            </section>
        </>
    )
}

export default Page