import { FilterQuery } from "mongoose";
import { Debt } from "../database/models/debt.model";
import { IDebtDocument } from "../database/types/IDebt.interface";
import DBResponse from "../models/DBResponse.model";

const create = async (
  amount: number,
  creditors: string[],
  debitors: string[],
  reason: string
): Promise<DBResponse> => {
  const debt = new Debt({
    amount: amount,
    creditors: creditors,
    debitors: debitors,
    reason: reason,
  });

  const result = await debt
    .save()
    .then((d: IDebtDocument) => new DBResponse(true, d))
    .catch((err: Error) => new DBResponse(false, err.message));
  return result;
};

const deleteById = async (id: string): Promise<DBResponse> => {
  const result = await Debt.findByIdAndDelete(id)
    .then((d: IDebtDocument | null) => new DBResponse(true, d))
    .catch((err: Error) => new DBResponse(false, err.message));
  return result;
};

const getUser = async (id: string, debits: boolean, credits: boolean): Promise<DBResponse> => {
  if (!credits && !debits)
    //just in case,shouldn't be here
    return new DBResponse(false, "bad request - no credits or debits are specified");

  let filter: FilterQuery<any>;
  const getCreditsQuery: FilterQuery<any> = {
    creditors: {
      $in: [id],
    },
  };
  const getDebitsQuery: FilterQuery<any> = {
    debitors: {
      $in: [id],
    },
  };

  if (credits && debits) filter = { $or: [getCreditsQuery, getDebitsQuery] };
  else if (credits && !debits) filter = getCreditsQuery;
  else filter = getDebitsQuery;

  const result = Debt.find(filter)
    .cache()
    .then((d: IDebtDocument[] | null) => new DBResponse(true, d))
    .catch((err: Error) => new DBResponse(false, err.message));
  return result;
};

export { create, deleteById, getUser };
