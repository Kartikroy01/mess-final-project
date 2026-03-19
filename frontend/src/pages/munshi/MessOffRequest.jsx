import React from 'react';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Card, Badge } from './components/UIComponents';

const MessOffRequestsPage = ({ requests, handleAction }) => {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Calendar className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Mess Off Requests</h2>
            <p className="text-sm text-gray-500">Review and manage student leave requests</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 md:py-4 px-1 md:px-4 font-bold text-slate-500 text-[10px] md:text-sm uppercase tracking-wider">Student</th>
                <th className="text-left py-3 md:py-4 px-1 md:px-4 font-bold text-slate-500 text-[10px] md:text-sm uppercase tracking-wider">Roll</th>
                <th className="text-left py-3 md:py-4 px-1 md:px-4 font-bold text-slate-500 text-[10px] md:text-sm uppercase tracking-wider">Room</th>
                <th className="text-left py-3 md:py-4 px-1 md:px-4 font-bold text-slate-500 text-[10px] md:text-sm uppercase tracking-wider">Duration</th>
                <th className="text-left py-3 md:py-4 px-1 md:px-4 font-bold text-slate-500 text-[10px] md:text-sm uppercase tracking-wider">Reason</th>
                <th className="text-left py-3 md:py-4 px-1 md:px-4 font-bold text-slate-500 text-[10px] md:text-sm uppercase tracking-wider">Status</th>
                <th className="text-center py-3 md:py-4 px-1 md:px-4 font-bold text-slate-500 text-[10px] md:text-sm uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-sm md:text-base">
                    <div>
                      <p className="font-medium text-gray-900">
                        <span className="md:hidden">{(req.studentName || '').split(' ')[0]}</span>
                        <span className="hidden md:inline">{req.studentName}</span>
                      </p>
                    </div>
                  </td>
                  <td className="py-3 md:py-4 px-1 md:px-4">
                    <span className="bg-slate-50 text-slate-500 px-1 py-0.5 md:px-2 md:py-1 rounded text-[9px] md:text-xs font-bold font-mono border border-slate-100">
                      {req.studentRollNo}
                    </span>
                  </td>
                  <td className="py-3 md:py-4 px-1 md:px-4">
                    <span className="text-[10px] md:text-sm font-bold text-gray-700">
                      {req.studentRoomNo || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 md:py-4 px-1 md:px-4">
                    <div className="flex items-center gap-1 md:gap-2 text-[9px] md:text-sm whitespace-nowrap">
                      <Calendar className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                      <span>
                        <span className="md:hidden">
                          {(() => {
                            const f = new Date(req.from).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toLowerCase();
                            const t = new Date(req.to).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toLowerCase();
                            return `${f} - ${t}`;
                          })()}
                        </span>
                        <span className="hidden md:inline">{req.from} to {req.to}</span>
                      </span>
                    </div>
                  </td>
                  <td className="py-3 md:py-4 px-1 md:px-4 max-w-[50px] md:max-w-none">
                    <p className="text-[9px] md:text-sm text-gray-600 truncate md:whitespace-normal">{req.reason}</p>
                  </td>
                  <td className="py-3 md:py-4 px-1 md:px-4">
                    <div className="scale-75 md:scale-100 origin-left">
                      <Badge variant={
                        req.status === 'Pending' ? 'warning' :
                        req.status === 'Approved' ? 'success' : 'danger'
                      }>
                        {req.status}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-3 md:py-4 px-1 md:px-4">
                    {req.status === 'Pending' && (
                      <div className="flex items-center justify-center gap-1 md:gap-2">
                        <button
                          onClick={() => handleAction(req.id, 'Approved')}
                          className="p-1 md:p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                        <button
                          onClick={() => handleAction(req.id, 'Rejected')}
                          className="p-1 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default MessOffRequestsPage;