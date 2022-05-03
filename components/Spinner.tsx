import { VscLoading } from "react-icons/vsc";

export default function Spinner() {
  return (
    <div className="grid w-100 h-100">
      <VscLoading className="animate-spin justify-self-center self-center m-auto" />
    </div>
  );
}
