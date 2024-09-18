import Bob from "../../assets/Bob.svg";

function BobPlaceHolder() {
  return (
    <div className="flex h-full items-center justify-center">
      <img src={Bob} alt="NKS-Bob" className="max-w-sm max-sm:pt-10" />
    </div>
  );
}

export default BobPlaceHolder;
