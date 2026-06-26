interface Props {
  title: string;
  detail?: string;
  subdetail?: string;
}

export function LoadingPlaceholder({ title, detail, subdetail }: Props) {
  return (
    <div className="placeholder loading-placeholder" style={{ height: "100vh" }}>
      <div className="loading-spinner" aria-hidden />
      <div className="loading-title">{title}</div>
      {detail && <p className="loading-detail">{detail}</p>}
      {subdetail && <p className="loading-subdetail">{subdetail}</p>}
    </div>
  );
}
