import Button from "components/Button";

interface SubmitProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  disabled?: boolean;
  [x: string]: any;
}

export default function Submit({ disabled, children, ...props }: SubmitProps) {
  return (
    <Button type="submit" disabled={disabled} {...props}>
      {children}
    </Button>
  );
}
