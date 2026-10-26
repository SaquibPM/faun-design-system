import { IconKey, IconOrchestrator } from "@faun-ds/icons";
import { Banner, Button, Checkbox, Field, Input, Link, PasswordInput, SegmentedControl } from "@faun-ds/react";
import { useState, type FormEvent } from "react";
import { H2 } from "../foundations/shared";
import "./patterns-b3.css";

type Errors = { email?: string; password?: string };

function LoginCard({ split }: { split: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const next: Errors = {};
    if (!email.trim()) next.email = "Enter your work email.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter an email like name@company.com.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    setFailed(false);
    setDone(false);
    if (Object.keys(next).length) return;
    setBusy(true);
    // The demo accepts one password so both outcomes can be tried.
    setTimeout(() => { setBusy(false); if (password === "faun") setDone(true); else setFailed(true); }, 700);
  };

  return (
    <div className="pt-login-frame" data-layout={split ? "split" : "centred"}>
      {split ? (
        <aside className="pt-login-aside" aria-hidden="true">
          <p className="pt-login-aside-title">Reporting that shows its work</p>
          <p className="pt-login-aside-text">Every figure keeps its evidence, and every agent action keeps its audit trail.</p>
        </aside>
      ) : null}
      <div className="pt-login-card">
        <div className="pt-login-brand"><span className="pt-login-mark" aria-hidden="true"><IconOrchestrator /></span>Faun</div>
        <div>
          <h3 className="pt-login-title">Sign in</h3>
          <p className="pt-login-sub">Use your work account to open Acme Industrial.</p>
        </div>
        {failed ? <Banner tone="danger" title="That email and password do not match">Check them and try again, or reset your password. The demo password is “faun”.</Banner> : null}
        {done ? <Banner tone="success" title="Signed in">In the product this is where the next page opens.</Banner> : null}
        <form className="pt-login-form" onSubmit={submit} noValidate>
          <Field label="Work email" error={errors.email} required>
            <Input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
          </Field>
          <Field label="Password" error={errors.password} required>
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <div className="pt-login-row">
            <Checkbox label="Keep me signed in on this device" />
            <Link href="#reset">Forgot password?</Link>
          </div>
          <Button type="submit" variant="solid" intent="accent" fullWidth loading={busy}>Sign in</Button>
        </form>
        <div className="pt-login-or">or</div>
        <Button variant="outline" fullWidth leadingIcon={<IconKey />}>Continue with single sign-on</Button>
      </div>
    </div>
  );
}

export function LoginPattern() {
  const [layout, setLayout] = useState("centred");
  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="example" lede="A sign-in page that asks for little, says what is wrong and keeps the person's input. Try it empty, with a bad email, and with a wrong password; the demo password is faun.">Example</H2>
        <div className="pt-login-switch">
          <SegmentedControl aria-label="Login layout" size="sm" value={layout} onValueChange={setLayout} options={[{ value: "centred", label: "Centred" }, { value: "split", label: "Split" }]} />
        </div>
        <LoginCard split={layout === "split"} />
      </section>
      <section className="fd-section">
        <H2 id="rules">Rules</H2>
        <ul className="fd-rules">
          <li>Ask only for what signs the person in: an email and a password, with single sign-on beside them for organisations that use it. Put the account choice before the password only when it changes the form.</li>
          <li>Label every field and keep the label when the person types. Never use a placeholder as the label. Set <code>autocomplete</code> (<code>username</code>, <code>current-password</code>) so password managers work, and never block paste.</li>
          <li>Give the password a show and hide control. It helps on phones and for long passphrases.</li>
          <li>Validate on submit. Name the problem and the fix for each field, in the field: “Enter an email like name@company.com”.</li>
          <li>When sign-in fails, say that the pair did not match without saying which half was wrong, and keep the email in place. Do not clear the form.</li>
          <li>Show progress on the button while the request runs, and keep it disabled only for that time.</li>
          <li>The centred layout suits most products. Use the split layout when the page also carries a message about the product; hide the side panel on narrow screens, where only the form matters.</li>
          <li>Offer reset and single sign-on as links and buttons beside the form, not as extra steps before it.</li>
        </ul>
      </section>
    </div>
  );
}
