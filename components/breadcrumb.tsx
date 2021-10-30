import styles from './breadcrumb.module.css';

type BreadcrumbProps = {
    children: React.ReactNode
};

const Breadcrumb = ({children}: BreadcrumbProps) => (<div className={styles.container}>{children}</div>);

export default Breadcrumb;