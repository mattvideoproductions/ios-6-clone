import { PropsWithChildren, ReactNode } from 'react';

type GroupedListProps = PropsWithChildren<{
  title?: string;
  footer?: ReactNode;
}>;

const GroupedList = ({ title, footer, children }: GroupedListProps) => {
  return (
    <section className="grouped-list">
      {title ? <header className="grouped-list__header">{title}</header> : null}
      <div className="grouped-list__body">{children}</div>
      {footer ? <footer className="grouped-list__footer">{footer}</footer> : null}
    </section>
  );
};

export default GroupedList;
