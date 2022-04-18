import React, {Fragment, useEffect, useState} from "react";
import {Dialog, Transition} from '@headlessui/react';
import {QuestionMarkCircleIcon} from "@heroicons/react/solid";


export default function IntroPopup() {
  let [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const didReadInstructions = localStorage.getItem('user-read-instructions') === 'true';

    setIsOpen(!didReadInstructions);
  }, []);

  function onReadInstructionsClick() {
    closeModal();
    localStorage.setItem('user-read-instructions', 'true');
  }

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  return (
    <>
      <div className="fixed z-10 left-4 top-6">
        <button
          type="button"
          onClick={openModal}
          className="
            text-sm font-medium text-white bg-zinc-800 rounded-md
            focus-visible:ring-opacity-75
          "
        >
          <QuestionMarkCircleIcon className="h-8 w-8" />
        </button>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-90"
          onClose={closeModal}
        >
          <div className="min-h-screen px-4 text-center">
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
              <div className="
                inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle
                transition-all transform bg-white shadow-xl rounded-xl
              ">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold leading-6 text-gray-900"
                >
                  Crypto game to support Ukraine
                </Dialog.Title>

                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    As more and more Ukrainian funds accepting Solana
                    {' '}
                    <a className="underline" target="_blank" rel="noreferrer" href="https://donate.thedigital.gov.ua/">[1]</a>
                    {' '}
                    <a className="underline" target="_blank" rel="noreferrer" href="https://www.comebackalive.in.ua/donate">[2]</a>
                    {' '}
                    <a className="underline" target="_blank" rel="noreferrer" href="https://palianytsia.com.ua/donate">[3]</a>.

                    We want to gamify donations and create piece of art stored forever on blockchain.

                    <br/>
                    <br/>

                    This is a <b>proof of concept</b> launched on devnet (test blockchain with fake money).
                    Create a
                    {' '}
                    <a className="underline" target="_blank" rel="noreferrer" href="https://phantom.appp/">
                      Phantom wallet,
                    </a>
                    {' '}
                    get some
                    {' '}
                    <a className="underline" target="_blank" rel="noreferrer" href="https://solfaucet.com/">
                      fake SOL
                    </a>
                    {' '}
                    and enjoy making pixel art.
                  </p>
                </div>

                <div className="mt-4">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://www.notion.so/Support-Ukraine-with-crypto-art-aca0eb6852ff453091e5d3e52b863eed"
                    className="
                      inline-flex justify-center px-4 py-2
                      text-sm font-medium text-white bg-indigo-700 border
                      border-transparent rounded-md hover:bg-indigo-800 focus:outline-none
                      focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500
                    "
                    onClick={onReadInstructionsClick}
                  >
                    Read full instructions
                  </a>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
