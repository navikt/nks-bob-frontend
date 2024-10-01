import Bob from "../../assets/bob-subtle-background.svg"

function BobPlaceHolder() {
  return (
    <div className='dialogcontent h-full items-center justify-center'>
      <img src={Bob} alt='NKS-Bob' className='h-auto w-full max-w-md' />
    </div>
  )
}

export default BobPlaceHolder
