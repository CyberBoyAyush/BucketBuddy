"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Check, X, Mail, Clock, Database } from "lucide-react";

interface Invitation {
  id: string;
  role: string;
  invitedAt: string;
  bucket: {
    id: string;
    name: string;
    provider: string;
  };
  inviter: {
    id: string;
    name: string;
    email: string;
  };
}

export default function MembersPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const response = await fetch("/api/invitations");
        if (response.ok) {
          const { invitations } = await response.json();
          setInvitations(invitations);
        }
      } catch (error) {
        console.error("Error fetching invitations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, []);

  const handleInvitation = async (invitationId: string, action: "accept" | "decline") => {
    setProcessing(invitationId);

    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invitationId,
          action,
        }),
      });

      if (response.ok) {
        setInvitations(invitations.filter(inv => inv.id !== invitationId));
      } else {
        const { error } = await response.json();
        alert(error || `Failed to ${action} invitation`);
      }
    } catch (error) {
      alert(`Failed to ${action} invitation`);
    } finally {
      setProcessing(null);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "aws":
        return "🟠";
      case "cloudflare":
        return "🟡";
      case "digitalocean":
        return "🔵";
      default:
        return "⚪";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Team & Invitations</h1>
          <p className="text-gray-400">
            Manage your bucket invitations and team memberships
          </p>
        </div>

        {/* Pending Invitations */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Pending Invitations ({invitations.length})
          </h2>
          
          {invitations.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No pending invitations</h3>
              <p className="text-gray-400">
                You'll see bucket invitations from other users here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 bg-gray-700/50 border border-gray-600 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getProviderIcon(invitation.bucket.provider)}</span>
                      <Database className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-white font-medium">{invitation.bucket.name}</h3>
                        <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full capitalize">
                          {invitation.role}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        Invited by {invitation.inviter.name} ({invitation.inviter.email})
                      </p>
                      <div className="flex items-center space-x-1 text-gray-500 text-xs mt-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(invitation.invitedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleInvitation(invitation.id, "accept")}
                      disabled={processing === invitation.id}
                      className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white text-sm rounded-lg transition-colors"
                    >
                      {processing === invitation.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Accept
                    </button>
                    <button
                      onClick={() => handleInvitation(invitation.id, "decline")}
                      disabled={processing === invitation.id}
                      className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white text-sm rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">About Team Collaboration</h3>
          <div className="text-blue-300 text-sm space-y-2">
            <p>
              <strong>Viewer:</strong> Can browse and download files from the bucket
            </p>
            <p>
              <strong>Editor:</strong> Can upload, download, rename, and delete files
            </p>
            <p>
              <strong>Admin:</strong> Full access including member management and bucket settings
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
