import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => <h1 className="text-3xl font-semibold text-accent" {...props} />,
    h2: (props) => <h2 className="mt-6 text-2xl font-semibold text-white" {...props} />,
    p: (props) => <p className="mt-3 leading-7 text-slate-200" {...props} />,
    strong: (props) => <strong className="text-white" {...props} />,
    code: (props) => <code className="rounded bg-slate-900 px-1.5 py-0.5 text-warm" {...props} />,
    ...components
  };
}
