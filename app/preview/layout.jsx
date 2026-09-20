import PreviewProvider from "./PreviewProvider";

export const metadata = {
  title: "Portfolio preview",
  robots: { index: false, follow: false },
};

export default function PreviewLayout({ children }) {
  return <PreviewProvider>{children}</PreviewProvider>;
}
