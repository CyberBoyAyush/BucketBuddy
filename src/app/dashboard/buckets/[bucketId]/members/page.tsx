"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, Plus, UserPlus, Settings, Trash2, Crown, Shield, Eye } from "lucide-react";
import Link from "next/link";

interface Member {
  id: string;
  role: string;
  invitedAt: string;
  acceptedAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
  inviter: {
    id: string;
    name: string;
    email: string;
  };
}

interface Bucket {
  id: string;
  name: string;
  provider: string;
  isOwner: boolean;
}

export default function BucketMembersPage() {
  const params = useParams();
  const router = useRouter();
  const bucketId = params.bucketId as string;
  
  const [bucket, setBucket] = useState<Bucket | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch bucket info
        const bucketResponse = await fetch(`/api/buckets/${bucketId}`);
        if (bucketResponse.ok) {
          const { bucket } = await bucketResponse.json();
          setBucket(bucket);
        }

        // Fetch members
        const membersResponse = await fetch(`/api/buckets/${bucketId}/members`);
        if (membersResponse.ok) {
          const { members } = await membersResponse.json();
          setMembers(members);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bucketId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setError("");

    try {
      const response = await fetch(`/api/buckets/${bucketId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      if (response.ok) {
        const { invitation } = await response.json();
        setMembers([invitation, ...members]);
        setInviteEmail("");
        setInviteRole("viewer");
        setShowInviteForm(false);
      } else {
        const { error } = await response.json();
        setError(error || "Failed to send invitation");
      }
    } catch (error) {
      setError("Failed to send invitation");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) {
      return;
    }

    try {
      const response = await fetch(`/api/buckets/${bucketId}/members/${memberId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMembers(members.filter(m => m.id !== memberId));
      } else {
        const { error } = await response.json();
        alert(error || "Failed to remove member");
      }
    } catch (error) {
      alert("Failed to remove member");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "editor":
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "text-yellow-400 bg-yellow-500/10";
      case "editor":
        return "text-blue-400 bg-blue-500/10";
      default:
        return "text-gray-400 bg-gray-500/10";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 hetzner-red"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!bucket) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold hetzner-text mb-2">Bucket not found</h3>
          <Link href="/dashboard/buckets" className="hetzner-red hover:text-red-300">
            Back to buckets
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href={`/dashboard/buckets/${bucketId}`}
              className="p-2 hetzner-text-muted hover:hetzner-text hetzner-hover rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold hetzner-text">{bucket.name} Members</h1>
              <p className="hetzner-text-muted">Manage access and permissions for this bucket</p>
            </div>
          </div>

          {bucket.isOwner && (
            <button
              onClick={() => setShowInviteForm(true)}
              className="inline-flex items-center px-4 py-2 hetzner-btn-primary rounded-lg transition-colors"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Invite Member
            </button>
          )}
        </div>

        {/* Invite Form */}
        {showInviteForm && (
          <div className="hetzner-card rounded-xl p-6">
            <h3 className="text-lg font-semibold hetzner-text mb-4">Invite New Member</h3>
            <form onSubmit={handleInvite} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium hetzner-text mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 hetzner-card hetzner-border rounded-lg hetzner-text placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors duration-150"
                    placeholder="user@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium hetzner-text mb-2">
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 hetzner-card hetzner-border rounded-lg hetzner-text focus:outline-none focus:border-red-500 transition-colors duration-150"
                  >
                    <option value="viewer">Viewer - Can view files</option>
                    <option value="editor">Editor - Can upload and delete files</option>
                    <option value="admin">Admin - Full access including member management</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  className="px-4 py-2 hetzner-btn-secondary rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="inline-flex items-center px-4 py-2 hetzner-btn-primary disabled:opacity-50 rounded-lg transition-colors"
                >
                  {inviting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Members List */}
        <div className="hetzner-card rounded-xl p-6">
          <h3 className="text-lg font-semibold hetzner-text mb-4">
            Members ({members.length})
          </h3>

          {members.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 hetzner-text-muted mx-auto mb-4" />
              <h4 className="text-lg font-medium hetzner-text mb-2">No members yet</h4>
              <p className="hetzner-text-muted mb-4">
                Invite team members to collaborate on this bucket
              </p>
              {bucket.isOwner && (
                <button
                  onClick={() => setShowInviteForm(true)}
                  className="inline-flex items-center px-4 py-2 hetzner-btn-primary rounded-lg transition-colors"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Invite First Member
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-white/5 hetzner-border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 hetzner-red-bg rounded-full flex items-center justify-center">
                      <span className="hetzner-text font-medium">
                        {member.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="hetzner-text font-medium">{member.user.name}</p>
                        {!member.acceptedAt && (
                          <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="hetzner-text-muted text-sm">{member.user.email}</p>
                      <p className="hetzner-text-subtle text-xs">
                        Invited by {member.inviter.name} on{" "}
                        {new Date(member.invitedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getRoleColor(member.role)}`}>
                      {getRoleIcon(member.role)}
                      <span className="text-xs font-medium capitalize">{member.role}</span>
                    </div>

                    {bucket.isOwner && member.user.id !== bucket.id && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-2 hetzner-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
