import { Request, Response, NextFunction } from 'express';
import Case from '../models/Case';
import Lawyer from '../models/Lawyer';

// GET /api/cases — get lawyer's own cases
export const getMyCases = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lawyer = await Lawyer.findOne({ userId: req.user._id });
    if (!lawyer) {
      res.status(404).json({ success: false, message: 'Lawyer profile not found' });
      return;
    }

    const { status, isPublic, page = 1, limit = 20 } = req.query;
    const filter: Record<string, any> = { lawyerId: lawyer._id };
    if (status) filter.status = status;
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Case.countDocuments(filter);
    const cases = await Case.find(filter)
      .sort({ filedDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, total, cases });
  } catch (err) {
    next(err);
  }
};

// POST /api/cases
export const createCase = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lawyer = await Lawyer.findOne({ userId: req.user._id });
    if (!lawyer) {
      res.status(404).json({ success: false, message: 'Lawyer profile not found' });
      return;
    }

    const newCase = await Case.create({ lawyerId: lawyer._id, ...req.body });

    // Update solved cases count if status is Resolved
    if (newCase.status === 'Resolved') {
      lawyer.solvedCases += 1;
      await lawyer.save();
    }

    res.status(201).json({ success: true, case: newCase });
  } catch (err) {
    next(err);
  }
};

// PUT /api/cases/:id — update a case
export const updateCase = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lawyer = await Lawyer.findOne({ userId: req.user._id });
    if (!lawyer) {
      res.status(404).json({ success: false, message: 'Lawyer profile not found' });
      return;
    }

    const caseDoc = await Case.findOne({ _id: req.params.id, lawyerId: lawyer._id });
    if (!caseDoc) {
      res.status(404).json({ success: false, message: 'Case not found' });
      return;
    }

    const wasResolved = caseDoc.status === 'Resolved';
    Object.assign(caseDoc, req.body);
    await caseDoc.save();

    // Update solved cases count
    const isNowResolved = caseDoc.status === 'Resolved';
    if (!wasResolved && isNowResolved) {
      lawyer.solvedCases += 1;
      await lawyer.save();
    } else if (wasResolved && !isNowResolved) {
      lawyer.solvedCases = Math.max(0, lawyer.solvedCases - 1);
      await lawyer.save();
    }

    res.json({ success: true, case: caseDoc });
  } catch (err) {
    next(err);
  }
};

// PUT /api/cases/:id/visibility — toggle public/private
export const toggleCaseVisibility = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lawyer = await Lawyer.findOne({ userId: req.user._id });
    if (!lawyer) {
      res.status(404).json({ success: false, message: 'Lawyer profile not found' });
      return;
    }

    const caseDoc = await Case.findOne({ _id: req.params.id, lawyerId: lawyer._id });
    if (!caseDoc) {
      res.status(404).json({ success: false, message: 'Case not found' });
      return;
    }

    caseDoc.isPublic = !caseDoc.isPublic;
    await caseDoc.save();

    res.json({ success: true, isPublic: caseDoc.isPublic, message: `Case is now ${caseDoc.isPublic ? 'public' : 'private'}` });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cases/:id
export const deleteCase = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lawyer = await Lawyer.findOne({ userId: req.user._id });
    if (!lawyer) {
      res.status(404).json({ success: false, message: 'Lawyer profile not found' });
      return;
    }

    const caseDoc = await Case.findOneAndDelete({ _id: req.params.id, lawyerId: lawyer._id });
    if (!caseDoc) {
      res.status(404).json({ success: false, message: 'Case not found' });
      return;
    }

    res.json({ success: true, message: 'Case deleted' });
  } catch (err) {
    next(err);
  }
};
