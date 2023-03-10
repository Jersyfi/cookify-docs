import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();

  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>

        <div className={styles.builtWith}>
          <img src="/img/built-with/typescript.svg" width={40} height={40} />
          <img src="/img/built-with/tailwind-css.svg" width={40} height={40} />
          <img src="/img/built-with/eslint.svg" width={40} height={40} />
          <img src="/img/built-with/prettier.svg" width={40} height={40} />
          <img src="/img/built-with/rollup.svg" width={40} height={40} />
          <img src="/img/built-with/postcss.svg" width={40} height={40} />
        </div>

        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs-react/intro">
            Get started with Cookify
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();

  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
