import styles from './layout.module.css';

type LayoutProps = {
    children: React.ReactNode[]
};

const Layout = ({children}: LayoutProps) => (<div className={styles.container}>{children}</div>);

export default Layout;