import {Provider} from '@ethersproject/providers';
import {Contract, Signer} from 'ethers';
import {RockPaperScissor} from './RockPaperScissor';
import RockPaperScissorABI from '../abi/RockPaperScissor.json'
import {config} from "./config";

export const getContract = (
    abi: any,
    address: string,
    signer?: Signer | Provider
) => {
    return new Contract(address, abi, signer);
};

export const getRockPaperScissorContract = (signer?: Signer | Provider): RockPaperScissor => {
    return getContract(
      RockPaperScissorABI,
      config.gameAddress,
        signer
    ) as RockPaperScissor;
};