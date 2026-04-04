/**
 * useLoading — Global Loading Hook
 * 
 * Import this wherever you need to show/hide the global loading overlay.
 * 
 * Usage Examples:
 * 
 * 1. Simple show/hide:
 *    const { setLoading } = useLoading();
 *    setLoading(true, 'Saving changes...');
 *    await doSomething();
 *    setLoading(false);
 * 
 * 2. Automatic wrapper (recommended):
 *    const { withLoading } = useLoading();
 *    const result = await withLoading(() => fetchData(), 'Loading your data...');
 * 
 * 3. On navigation (e.g. router.push):
 *    const { setLoading } = useLoading();
 *    const router = useRouter();
 *    const navigate = (href: string, msg?: string) => {
 *        setLoading(true, msg);
 *        router.push(href);
 *        // Loader auto-hides when route settles (via NavigationLoader)
 *    };
 */
export { useLoading } from '@/context/LoadingContext';
