import React, { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface GenericPopupProps {
  isOpen: boolean;
  onClose(): void;
  containerStyle: string;
}

export const GenericPopup: React.FC<GenericPopupProps> = ({
  isOpen,
  onClose,
  children,
  containerStyle,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-90"
        onClose={onClose}
      >
        <div className="min-h-screen px-4 text-center" ref={ref}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div
              className={`
              inline-block w-full p-6 my-8 overflow-hidden text-left align-middle
              transition-all transform bg-white shadow-xl rounded-xl ${containerStyle}
            `}
            >
              {children}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
