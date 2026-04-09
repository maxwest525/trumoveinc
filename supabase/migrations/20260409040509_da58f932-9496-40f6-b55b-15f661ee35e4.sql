CREATE POLICY "Public can read published blog posts"
ON public.blog_posts
FOR SELECT
TO anon, authenticated
USING (status = 'published');